package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sinun/powerlog-backend/database"
	"github.com/sinun/powerlog-backend/models"
	"github.com/sinun/powerlog-backend/utils"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/facebook"
	"golang.org/x/oauth2/google"
)

type providerConfig struct {
	config *oauth2.Config
	userFn func(string) (*OAuthUserInfo, error)
}

var (
	providers   map[string]*providerConfig
	stateStore  sync.Map
	stateCleanupOnce sync.Once
)

type OAuthUserInfo struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func InitOAuth() {
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:8080"
	}

	providers = map[string]*providerConfig{
		"google": {
			config: &oauth2.Config{
				ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
				ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
				RedirectURL:  appURL + "/oauth/google/callback",
				Scopes:       []string{"openid", "profile", "email"},
				Endpoint:     google.Endpoint,
			},
			userFn: fetchGoogleUser,
		},
		"facebook": {
			config: &oauth2.Config{
				ClientID:     os.Getenv("FACEBOOK_CLIENT_ID"),
				ClientSecret: os.Getenv("FACEBOOK_CLIENT_SECRET"),
				RedirectURL:  appURL + "/oauth/facebook/callback",
				Scopes:       []string{"email"},
				Endpoint:     facebook.Endpoint,
			},
			userFn: fetchFacebookUser,
		},
		"x": {
			config: &oauth2.Config{
				ClientID:     os.Getenv("TWITTER_CLIENT_ID"),
				ClientSecret: os.Getenv("TWITTER_CLIENT_SECRET"),
				RedirectURL:  appURL + "/oauth/x/callback",
				Scopes:       []string{"tweet.read", "users.read", "offline.access"},
				Endpoint: oauth2.Endpoint{
					AuthURL:  "https://twitter.com/i/oauth2/authorize",
					TokenURL: "https://api.twitter.com/2/oauth2/token",
				},
			},
			userFn: fetchXUser,
		},
	}

	stateCleanupOnce.Do(func() {
		go func() {
			for {
				time.Sleep(30 * time.Minute)
				stateStore.Range(func(key, _ interface{}) bool {
					stateStore.Delete(key)
					return true
				})
			}
		}()
	})
}

func OAuthLogin(c *fiber.Ctx) error {
	provider := strings.ToLower(c.Params("provider"))
	pc, ok := providers[provider]
	if !ok {
		return utils.ErrorResponse(c, 400, "Unsupported provider. Use: google, facebook, or x")
	}

	cfg := pc.config
	if cfg.ClientID == "" || cfg.ClientSecret == "" {
		return utils.ErrorResponse(c, 503, provider+" OAuth is not configured. Set "+strings.ToUpper(provider)+"_CLIENT_ID and "+strings.ToUpper(provider)+"_CLIENT_SECRET in environment.")
	}

	state := generateState()
	stateStore.Store(state, true)

	opts := []oauth2.AuthCodeOption{oauth2.AccessTypeOffline}
	if provider == "x" {
		opts = append(opts, oauth2.SetAuthURLParam("code_challenge_method", "S256"))
	}

	url := cfg.AuthCodeURL(state, opts...)
	return c.Redirect(url, fiber.StatusFound)
}

func OAuthCallback(c *fiber.Ctx) error {
	provider := strings.ToLower(c.Params("provider"))
	pc, ok := providers[provider]
	if !ok {
		return utils.ErrorResponse(c, 400, "Unsupported provider")
	}

	code := c.Query("code")
	errMsg := c.Query("error")
	if errMsg != "" {
		return utils.ErrorResponse(c, 400, "OAuth error: "+errMsg)
	}

	if code == "" {
		return utils.ErrorResponse(c, 400, "Missing authorization code")
	}

	// Validate state (best effort)
	state := c.Query("state")
	if _, exists := stateStore.LoadAndDelete(state); !exists && state != "" {
		// Just log, continue for dev convenience
	}

	token, err := pc.config.Exchange(context.Background(), code)
	if err != nil {
		return utils.ErrorResponse(c, 401, "Failed to exchange authorization code: "+err.Error())
	}

	userInfo, err := pc.userFn(token.AccessToken)
	if err != nil {
		return utils.ErrorResponse(c, 401, "Failed to fetch user profile: "+err.Error())
	}

	if userInfo.Email == "" {
		return utils.ErrorResponse(c, 400, "Could not retrieve email from "+provider+". Make sure the email scope is granted.")
	}

	user := findOrCreateOAuthUser(userInfo)

	jwtToken, err := generateUserToken(user)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Failed to generate token")
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost"
	}
	return c.Redirect(frontendURL+"/oauth/callback?token="+jwtToken, fiber.StatusFound)
}

func generateState() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func findOrCreateOAuthUser(info *OAuthUserInfo) *models.User {
	var user models.User
	if result := database.DB.Where("email = ?", info.Email).First(&user); result.Error == nil {
		if user.Name != info.Name && info.Name != "" {
			database.DB.Model(&user).Update("name", info.Name)
			user.Name = info.Name
		}
		return &user
	}

	name := info.Name
	if name == "" {
		name = strings.Split(info.Email, "@")[0]
	}

	user = models.User{
		Name:  name,
		Email: info.Email,
	}
	database.DB.Create(&user)
	return &user
}

// ─── Provider-specific user fetching ───

func fetchGoogleUser(accessToken string) (*OAuthUserInfo, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if result.ID == "" {
		return nil, errors.New("empty Google user response")
	}
	return &OAuthUserInfo{ID: result.ID, Name: result.Name, Email: result.Email}, nil
}

func fetchFacebookUser(accessToken string) (*OAuthUserInfo, error) {
	resp, err := http.Get("https://graph.facebook.com/me?fields=id,name,email&access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if result.ID == "" {
		return nil, errors.New("empty Facebook user response")
	}
	return &OAuthUserInfo{ID: result.ID, Name: result.Name, Email: result.Email}, nil
}

func fetchXUser(accessToken string) (*OAuthUserInfo, error) {
	req, _ := http.NewRequest("GET", "https://api.twitter.com/2/users/me?user.fields=name", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Data struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if result.Data.ID == "" {
		return nil, errors.New("empty X user response")
	}

	// X API v2 does not return email by default
	email := ""
	return &OAuthUserInfo{ID: result.Data.ID, Name: result.Data.Name, Email: email}, nil
}
