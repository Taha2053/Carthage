import Navbar from './Navbar'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <Navbar />

      <div className="flex flex-col items-center pt-20 px-4">
        <h1
          className="select-none font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent"
          style={{
            fontFamily: "'General Sans', 'Geist Sans', sans-serif",
            fontSize: 'clamp(80px, 16vw, 230px)',
            backgroundImage: 'linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)',
          }}
        >
          Grow
        </h1>

        <p className="text-hero-sub text-center text-lg leading-8 max-w-md mt-4 opacity-80">
          The most powerful AI ever deployed
          <br />
          in talent acquisition
        </p>

        <Button
          variant="heroSecondary"
          className="mt-8 mb-[66px] px-[29px] py-[24px]"
        >
          Schedule a Consult
        </Button>
      </div>
    </section>
  )
}
