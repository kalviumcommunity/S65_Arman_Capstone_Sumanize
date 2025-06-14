import { CursorClick } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Crown, HardHat, Horse } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function EmptyState({ onSendMessage }) {
  const demoSummaries = [
    {
      id: "1",
      icon: <Crown size={24} weight="bold" className="inline-block" />,
      title: "The Roman Empire",
      description:
        "An exploration of the Roman Empire's rise, innovations, decline, and its lasting influence",
      content: `The Roman Empire, a civilization that endured for over a millennium, stands as a monumental testament to human ambition, organization, and ingenuity. From its mythical founding in the 8th century BC to the fall of the Western Roman Empire in 476 AD, Rome evolved from a small city-state into a sprawling empire that encompassed the Mediterranean and vast swathes of Europe, North Africa, and the Middle East. Its history is a dramatic saga of republican ideals, imperial grandeur, and eventual decline, leaving an indelible mark on the course of Western civilization.
The transition from the Roman Republic to the Roman Empire was a pivotal period marked by political upheaval and the ambition of powerful men. The Republic, established in 509 BC after the overthrow of the monarchy, was characterized by a complex system of elected magistrates and a powerful Senate. However, by the 1st century BC, internal strife, civil wars, and the rise of influential military leaders like Julius Caesar strained the republican framework. It was Caesar's adopted son, Octavian, who, after defeating his rivals, skillfully navigated the political landscape, assuming the title of Augustus and becoming the first Roman emperor in 27 BC. This marked the beginning of the Imperial era, a period of autocratic rule under a single emperor.
The first two centuries of the Empire are often referred to as the Pax Romana, or "Roman Peace," a period of unprecedented stability, prosperity, and territorial expansion. During this time, the Empire reached its greatest extent under Emperor Trajan in 117 AD. This era witnessed remarkable achievements in various fields. Roman engineers constructed an extensive network of roads, aqueducts, and monumental structures like the Colosseum and the Pantheon, many of which still stand today. They perfected the use of concrete, which allowed for the creation of durable and architecturally complex buildings. In law, the Romans developed a sophisticated legal system based on principles of justice and fairness, which became the foundation for many modern legal systems. Concepts such as the separation of governmental powers, the veto, and representation were also developed and recorded by the Romans.
Despite its immense power, the Roman Empire was not immune to decline. The 3rd century AD saw a period of crisis marked by civil war, plague, and barbarian invasions. A combination of factors contributed to the eventual fall of the Western Roman Empire. Constant wars and military overspending led to a severe financial crisis, with oppressive taxation and inflation widening the gap between the rich and the poor. The vastness of the Empire made it difficult to govern, and a string of ineffective and short-lived emperors created political instability. Furthermore, increasing pressure from Germanic tribes and other "barbarian" groups along the Empire's borders culminated in the sack of Rome in 410 AD by the Visigoths and again in 455 AD by the Vandals. In 476 AD, the last Western Roman Emperor, Romulus Augustulus, was deposed, marking a symbolic end to Roman rule in the West.
The legacy of the Roman Empire is vast and multifaceted. Its influence can be seen in the Romance languages derived from Latin, the alphabet used by much of the world, and the enduring principles of Roman law and governance. Roman architecture continues to inspire, and their engineering marvels remain a testament to their skill. The spread of Christianity was also significantly aided by the Empire's infrastructure and eventual adoption of the faith. Though the Western Empire fell, the Eastern Roman Empire, also known as the Byzantine Empire, continued for another thousand years, preserving and transmitting classical knowledge. The Roman Empire, therefore, is not just a chapter in ancient history but a foundational element of the modern world.`,
      prompt:
        "Summarize this essay on the Roman Empire, highlighting its key phases, major achievements, and the reasons for its decline.",
    },
    {
      id: "2",
      icon: <HardHat size={24} weight="bold" className="inline-block" />,
      title: "The Industrial Revolution",
      description:
        "An Industrial Revolution overview, key societal and economic shifts, and its lasting global impact.",
      content: `The Industrial Revolution, which began in Great Britain in the late 18th century and subsequently spread across the globe, represents one of the most significant turning points in human history. It was a period of profound transformation, marking the transition from agrarian, handicraft-based economies to societies dominated by machine manufacturing and industrial production. This fundamental shift did not just alter how goods were made; it reshaped society, politics, and the environment, setting the stage for the modern world.
At the heart of the revolution were a series of groundbreaking technological innovations. The invention of the steam engine, perfected by James Watt, was arguably the most crucial development. It provided a new source of power that liberated industry from its reliance on wind, water, or muscle. This technology powered factories, enabled the mass production of textiles through inventions like the spinning jenny and power loom, and revolutionized transportation with the advent of the steam locomotive and steamboat. Concurrently, advancements in iron and steel production, such as the Bessemer process, provided the strong, durable materials necessary to build the machines, bridges, and railways that became the backbone of the new industrial landscape.
The societal consequences of this industrialization were immense and multifaceted. A massive migration occurred as people left rural areas in search of work, leading to the rapid and often chaotic growth of cities. This urbanization created unprecedented social challenges, including overcrowded and unsanitary living conditions, long working hours in dangerous factories, and the widespread use of child labor. A new social structure emerged, characterized by a growing industrial working class (the proletariat) and a new, wealthy middle class of factory owners, inventors, and merchants (the bourgeoisie). These changes fueled new political ideologies, such as socialism and communism, which sought to address the stark inequalities created by industrial capitalism.
The long-term impact of the Industrial Revolution is undeniable. It spurred a wave of global trade and colonialism as industrial nations sought raw materials for their factories and new markets for their manufactured goods. It led to a sustained rise in the standard of living for many, though this progress was unevenly distributed. The era also established a new relationship between humanity and the environment, initiating the large-scale consumption of fossil fuels and industrial pollution that continue to have significant ecological consequences today. In essence, the Industrial Revolution was not merely a period of new machines; it was the catalyst that forged the economic and social systems of the modern age, leaving a complex legacy of progress and peril that continues to shape our world.`,
      prompt:
        "Analyze this text on the Industrial Revolution and provide a summary of its core innovations and societal consequences.",
    },
    {
      id: "3",
      icon: <Horse size={24} weight="bold" className="inline-block" />,
      title: "An Expansion Strategy",
      description:
        "A strategic plan for 'Aperture Innovations' to enter the European market, targeting key sectors",
      content: `To: Executive Leadership Team, Aperture Innovations
From: Strategy & Growth Department
Date: June 13, 2025
Subject: Project 'Odyssey' - Strategic Plan for European Market Entry
1.0 Executive Summary
This document outlines the strategic plan, codenamed Project 'Odyssey', for Aperture Innovations' expansion into the European Union (EU) market. The objective is to establish a significant market presence within 18 months, targeting an initial revenue goal of \(\$8\) million by the end of the period. This expansion is critical for diversifying our revenue streams and capitalizing on the growing demand for our AI-driven data analytics platform, 'Synapse'. The strategy is built on a three-phase approach: Market Seeding, Operational Ramp-Up, and Growth Acceleration. Success will be measured by revenue targets, customer acquisition cost (CAC), market share, and brand recognition.
2.0 Market Analysis & Opportunity
The EU represents a \(\$2.5\) billion addressable market for advanced data analytics solutions, with a projected compound annual growth rate (CAGR) of \(14\%\). Our primary competitors, 'DataWeave' and 'Cognito Analytics', have a foothold but lack our platform's proprietary predictive modeling capabilities and user-friendly interface. Our analysis identifies Germany, France, and the Netherlands as initial target markets due to their strong industrial base, high tech adoption rates, and favorable regulatory environments. A key opportunity lies in targeting mid-market enterprises (\(500-5,000\) employees) in the manufacturing and logistics sectors, which are currently underserved by our competitors who focus on large-scale enterprise clients.
3.0 Strategic Phases & Key Initiatives
Phase 1: Market Seeding (Months 1-6)
The initial phase focuses on establishing a foundational presence and generating early traction.

Legal & Compliance: Establish a legal entity in Dublin, Ireland, to serve as our EU headquarters, ensuring full GDPR compliance from day one.
Team Building: Hire a core team consisting of a Regional Director, two enterprise sales representatives, and one marketing manager.
Brand Awareness: Launch a targeted digital marketing campaign focused on LinkedIn and industry-specific publications. Host two webinars showcasing 'Synapse' case studies relevant to the European manufacturing sector.
Pilot Program: Onboard 5-7 "Lighthouse Customers" in our target markets on a discounted or pilot basis to build social proof and gather testimonials.
Phase 2: Operational Ramp-Up (Months 7-12)
This phase involves scaling operations based on initial learnings.

Sales Team Expansion: Grow the sales team to six representatives, assigning dedicated reps to Germany and France.
Channel Partnerships: Develop a channel partner program, signing agreements with at least three established IT consulting firms in the region.
Product Localization: Fully localize the 'Synapse' platform and all marketing collateral into German and French.
Phase 3: Growth Acceleration (Months 13-18)
The final phase is focused on aggressive growth and market penetration.

Marketing Investment: Increase marketing spend by \(50\%\), focusing on account-based marketing (ABM) for high-value prospects.
Customer Success: Establish a dedicated EU customer success team to drive adoption, renewals, and upsells.
Expansion Evaluation: Assess performance and begin planning for expansion into secondary markets, such as the Nordics and Spain.
4.0 Financial Projections & KPIs
We project a total investment of \(\$3.5\) million for Project 'Odyssey' over 18 months, with an expected return on investment within 36 months. Key KPIs include: achieving a CAC below \(\$15,000\), acquiring 75 new customers, and capturing \(3\%\) of the target market share by the end of the period. This strategic expansion represents a calculated investment in the long-term global leadership of Aperture Innovations.`,
      prompt:
        "Condense this strategic business plan into a summary covering the main objectives, market opportunity, and phased rollout strategy.",
    },
  ];

  const handleDemoClick = (demo) => {
    if (onSendMessage) {
      onSendMessage({
        content: demo.prompt,
        pastedContent: demo.content,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center w-full">
        <div className="flex justify-center">
          <CursorClick size={48} />
        </div>
        <h2 className="text-6xl font-serif mb-4">Sumanize</h2>

        <div className="text-sm text-comet-550 bg-comet-850 rounded-xl p-4 max-w-md mx-auto mb-4">
          Paste large documents directly for a cleaner conversation or use the
          demo examples below.
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <TooltipProvider>
            <div className="flex gap-3 justify-center">
              {demoSummaries.map((demo) => {
                return (
                  <Tooltip key={demo.id}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleDemoClick(demo)}
                        className="h-auto flex-1 max-w-72 bg-comet-850 hover:bg-comet-950 rounded-xl flex-col items-start p-4 text-left whitespace-normal cursor-pointer"
                      >
                        <h3 className="font-medium text-comet-400 flex items-center gap-2 text-sm">
                          {demo.icon}
                          {demo.title}
                        </h3>
                        <p className="text-comet-500 font-serif text-sm line-clamp-3">
                          {demo.description}
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="max-w-xs text-sm text-comet-100"
                    >
                      Click to summarize this topic
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
