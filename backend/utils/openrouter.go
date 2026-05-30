package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type OpenRouterRequest struct {
	Model    string              `json:"model"`
	Messages []OpenRouterMessage `json:"messages"`
}

type OpenRouterMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenRouterResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func RequestAIAnalysis(userID uint, contextData string) (string, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPENROUTER_API_KEY not set")
	}

	baseURL := os.Getenv("OPENROUTER_BASE_URL")
	if baseURL == "" {
		baseURL = "https://openrouter.ai/api/v1"
	}

	primaryModel := os.Getenv("OPENROUTER_MODEL_PRIMARY")
	if primaryModel == "" {
		primaryModel = "meta-llama/llama-3.1-8b-instruct:free"
	}

	fallbackModel := os.Getenv("OPENROUTER_MODEL_FALLBACK")
	if fallbackModel == "" {
		fallbackModel = "google/gemma-2-9b-it:free"
	}

	systemPrompt := "Kamu adalah coach powerlifting berpengalaman. Berikan analisis singkat dan rekomendasi program dalam Bahasa Indonesia. Fokus pada data, bukan motivasi umum. Maksimal 200 kata."

	content, err := callOpenRouter(baseURL, apiKey, primaryModel, systemPrompt, contextData)
	if err != nil {
		content, err = callOpenRouter(baseURL, apiKey, fallbackModel, systemPrompt, contextData)
		if err != nil {
			return "", fmt.Errorf("OpenRouter analysis failed: %v", err)
		}
	}

	return content, nil
}

func callOpenRouter(baseURL, apiKey, model, systemPrompt, userContent string) (string, error) {
	body := OpenRouterRequest{
		Model: model,
		Messages: []OpenRouterMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userContent},
		},
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", strings.TrimRight(baseURL, "/")+"/chat/completions", bytes.NewReader(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result OpenRouterResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", err
	}

	if result.Error != nil {
		return "", fmt.Errorf("OpenRouter API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("OpenRouter returned no choices")
	}

	return result.Choices[0].Message.Content, nil
}
