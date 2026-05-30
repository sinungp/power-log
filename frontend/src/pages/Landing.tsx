import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorksSection from '../components/HowItWorksSection'
import PricingSection from '../components/PricingSection'
import TestimonialsSection from '../components/TestimonialsSection'
import FloatingChat from '../components/FloatingChat'
import { publicChat } from '../api/chatApi'

export default function Landing() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FloatingChat
        mode="public"
        onSend={async (msg) => {
          const res = await publicChat(msg)
          return res.data.data.reply
        }}
      />
    </>
  )
}
