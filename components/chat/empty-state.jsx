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
      content: `## The Enduring Legacy of the Roman Empire

The Roman Empire, a civilization that dominated the Mediterranean world for centuries, left an indelible mark on law, politics, architecture, and culture that continues to resonate today. From its humble beginnings as a small settlement on the Italian peninsula, Rome rose to become a formidable power, shaping the course of Western civilization. Its rise, zenith, and eventual decline offer invaluable lessons in the dynamics of power, governance, and societal evolution.

The seeds of the Roman Empire were sown with the end of the Roman Republic. Internal strife and the assassination of Julius Caesar created a power vacuum, paving the way for the emergence of Augustus Caesar. In 27 BC, Augustus established the Empire, ushering in an era of relative peace and stability known as the Pax Romana. This period, lasting over two centuries, witnessed significant territorial expansion, economic prosperity, and a flourishing of the arts and sciences. The Empire's vast reach encompassed territories across Europe, North Africa, and the Middle East, fostering a melting pot of cultures and ideas.

The success of the Roman Empire can be attributed to its sophisticated governance mechanisms. The Roman legal system, exemplified by the Twelve Tables and later the Corpus Juris Civilis, established principles of justice and equity that continue to influence modern legal frameworks. The Empire's administrative structure, with its efficient bureaucracy and infrastructure, facilitated the management of its vast territories. The construction of roads, aqueducts, and public buildings showcased Roman engineering prowess and contributed to the Empire's economic and social development.

However, the seeds of decline were also present within the Empire. Over time, internal political corruption, economic disparities, and external pressures from barbarian tribes weakened the Empire's foundations. The sheer size of the Empire made it difficult to govern effectively, leading to administrative inefficiencies and regional fragmentation. The reliance on slave labor created social tensions, while the gap between the wealthy elite and the impoverished masses widened.

In 395 AD, the Empire was formally divided into the Western and Eastern Roman Empires, a move that reflected the growing challenges of governing such a vast territory. The Western Roman Empire, plagued by internal weaknesses and external invasions, eventually fell in 476 AD. The Eastern Roman Empire, also known as the Byzantine Empire, continued to thrive for another thousand years, preserving Roman traditions and culture.

Despite its eventual decline and fall, the legacy of the Roman Empire endures. Its contributions to law, language, architecture, and political thought continue to shape Western civilization. The Latin language, the foundation of the Romance languages, is a testament to Rome's linguistic influence. Roman architectural innovations, such as arches, domes, and concrete, are still employed in modern construction. The principles of Roman law and governance continue to inform legal and political systems around the world. The Roman Empire stands as a powerful reminder of the rise and fall of civilizations, and its enduring legacy serves as a testament to its profound impact on human history.`,
      prompt:
        "Summarize this essay on the Roman Empire, highlighting its key phases, major achievements, and the reasons for its decline.",
    },
    {
      id: "2",
      icon: <HardHat size={24} weight="bold" className="inline-block" />,
      title: "The Industrial Revolution",
      description:
        "An Industrial Revolution overview, key societal and economic shifts, and its lasting global impact.",
      content: `## The Transformative Power of the Industrial Revolution

The Industrial Revolution, a period of unprecedented technological advancement and societal transformation, fundamentally reshaped the world, ushering in new modes of production, transportation, and communication. Originating in Great Britain in the late 18th century, it quickly spread across Europe and North America, impacting every facet of human life, from agriculture and manufacturing to social structures and global power dynamics. Its legacy continues to influence our world today, shaping our economies, environments, and social interactions.

The genesis of the Industrial Revolution can be traced to a confluence of factors, including technological innovation, access to resources, and favorable economic conditions. The invention of new machines, such as the spinning jenny and the power loom, revolutionized textile production, leading to increased efficiency and output. The development of the steam engine, pioneered by James Watt, provided a powerful new source of energy that could be applied to a wide range of industries. Access to abundant coal and iron ore in Great Britain fueled these technological advancements, providing the raw materials necessary for industrial production. Furthermore, a stable political system and a culture of innovation fostered an environment conducive to entrepreneurship and investment.

The impact of the Industrial Revolution on manufacturing was profound. Factories emerged as centralized hubs of production, replacing traditional cottage industries. Mass production techniques, such as the assembly line, enabled the production of goods on an unprecedented scale. This led to a dramatic increase in the availability and affordability of manufactured goods, transforming consumer culture. The rise of factories also created new forms of labor organization, with workers often facing harsh conditions, long hours, and low wages.

The Industrial Revolution also revolutionized transportation. The invention of the steam locomotive and the development of railways transformed land transportation, enabling the rapid movement of goods and people. The construction of canals further facilitated inland navigation. The steamship revolutionized maritime transportation, connecting distant regions and facilitating global trade. These advancements in transportation infrastructure played a crucial role in expanding markets and facilitating the movement of raw materials and finished products.

The social consequences of the Industrial Revolution were far-reaching. The growth of factories led to the rapid urbanization, as people migrated from rural areas to urban centers in search of work. Cities became overcrowded and unsanitary, leading to the spread of disease and social unrest. The rise of a new industrial working class created new social divisions, with disparities in wealth and power becoming increasingly pronounced. The Industrial Revolution also led to the emergence of new social movements, such as labor unions, advocating for improved working conditions and social justice.

The Industrial Revolution had a significant impact on the environment. The burning of coal to power factories and transportation led to increased air pollution, contributing to respiratory problems and other health issues. The extraction of raw materials, such as coal and iron ore, caused deforestation and environmental degradation. The disposal of industrial waste polluted rivers and streams, harming aquatic ecosystems. The Industrial Revolution laid the foundation for many of the environmental challenges we face today.

In conclusion, the Industrial Revolution was a transformative period in human history, characterized by unprecedented technological advancement, economic growth, and social change. While it brought about significant improvements in living standards and increased access to goods and services, it also created new social and environmental challenges. Understanding the Industrial Revolution is essential for comprehending the trajectory of modern society and for addressing the challenges we face today.`,
      prompt:
        "Analyze this text on the Industrial Revolution and provide a summary of its core innovations and societal consequences.",
    },
    {
      id: "3",
      icon: <Horse size={24} weight="bold" className="inline-block" />,
      title: "An Expansion Strategy",
      description:
        "A strategic plan for 'Aperture Innovations' to enter the European market, targeting key sectors",
      content: `## Strategic Plan: Aperture Innovations - European Market Entry

**Executive Summary:** This strategic plan outlines Aperture Innovations' approach to entering the European market, focusing on phased market entry and targeting key sectors where its technological solutions offer a competitive advantage. The plan emphasizes localized adaptation, strategic partnerships, and a robust understanding of European regulations and cultural nuances to ensure sustainable growth and market leadership.

**1. Mission Statement:** To establish Aperture Innovations as a leading provider of innovative technological solutions in the European market, driving growth and creating value for customers, partners, and stakeholders.

**2. Situation Analysis:**

*   **Strengths:** Proprietary technology, proven track record in existing markets, strong R&D capabilities.
*   **Weaknesses:** Limited brand awareness in Europe, lack of established distribution channels, limited understanding of local market specifics.
*   **Opportunities:** Growing demand for technology solutions in key sectors (Renewable Energy, Healthcare, Advanced Manufacturing), favorable government policies supporting innovation, potential for strategic partnerships.
*   **Threats:** Intense competition from established European players, varying regulatory landscapes across countries, economic uncertainty, potential for trade barriers.

**3. Target Markets and Sectors:**

*   **Phase 1 (Initial Focus):**
    *   **Renewable Energy:** Focusing on Germany and Denmark, targeting solutions for optimizing solar and wind energy production, grid management, and energy storage.
    *   **Healthcare:** Targeting the UK and Netherlands, focusing on AI-powered diagnostic tools, telemedicine platforms, and data analytics solutions for improving patient outcomes and operational efficiency.
*   **Phase 2 (Expansion):**
    *   **Advanced Manufacturing:** Expanding to France and Italy, targeting solutions for automation, predictive maintenance, and supply chain optimization.

**4. Objectives:**

*   **Year 1:** Establish a presence in Germany, Denmark, the UK, and the Netherlands; achieve \$5 million in revenue; secure 5 key strategic partnerships.
*   **Year 3:** Expand into France and Italy; achieve \$20 million in revenue; increase brand awareness by 50%.
*   **Year 5:** Become a recognized leader in targeted sectors; achieve \$50 million in revenue; establish a European R&D center.

**5. Strategies:**

*   **Market Entry Strategy:** Phased entry, starting with key sectors in select countries and expanding based on performance and market opportunities.
*   **Product Strategy:** Adapt products and services to meet European standards and regulations; offer localized support and training.
*   **Pricing Strategy:** Competitive pricing based on value proposition; consider regional variations in purchasing power.
*   **Marketing Strategy:** Digital marketing campaigns targeting specific industries and customer segments; participation in industry trade shows and conferences; development of case studies and testimonials.
*   **Sales Strategy:** Build a direct sales team in key regions; establish strategic partnerships with local distributors and integrators; focus on building long-term relationships with customers.
*   **Partnership Strategy:** Collaborate with local research institutions, universities, and technology companies to enhance product development and market access.
*   **Operational Strategy:** Establish a European headquarters in a central location (e.g., Amsterdam or Berlin); build a localized support team; ensure compliance with European data protection regulations (GDPR).

**6. Action Plan:**

*   **Months 1-3:** Conduct detailed market research; finalize market entry strategy; establish European headquarters; recruit key personnel.
*   **Months 3-6:** Develop localized marketing materials; launch digital marketing campaigns; attend industry trade shows; secure initial partnerships.
*   **Months 6-12:** Begin sales operations; deliver initial product deployments; collect customer feedback; refine strategies based on market response.

**7. Financial Projections:**

*   Detailed financial projections, including revenue forecasts, cost estimates, and profitability analysis, will be developed based on market research and sales forecasts. (Note: Specific numbers would be included in a real-world plan).

**8. Risk Assessment and Mitigation:**

*   **Risk:** Intense competition. **Mitigation:** Differentiate through superior technology and customer service.
*   **Risk:** Regulatory hurdles. **Mitigation:** Engage with regulatory bodies and seek expert advice.
*   **Risk:** Economic uncertainty. **Mitigation:** Diversify target markets and sectors.
*   **Risk:** Cultural differences. **Mitigation:** Hire local talent and adapt marketing and sales strategies.

**9. Evaluation and Control:**

*   Key performance indicators (KPIs) will be tracked regularly to monitor progress and identify areas for improvement.
*   Regular reviews will be conducted to assess the effectiveness of the strategic plan and make necessary adjustments.

**10. Exit Strategy (Contingency):**

*   In the unlikely event of failure, potential exit strategies include: acquisition by a larger company, strategic partnerships, or a managed market withdrawal.

**Conclusion:**

This strategic plan provides a roadmap for Aperture Innovations to successfully enter and thrive in the European market. By focusing on targeted sectors, building strong partnerships, and adapting to local conditions, Aperture Innovations can achieve its objectives and establish a sustainable competitive advantage.`,
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
          <CursorClick size={48} weight="bold" />
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
                        className="h-auto flex-1 max-w-72 bg-comet-850 hover:bg-comet-900 transition-colors duration-300 rounded-xl flex-col items-start p-4 text-left whitespace-normal cursor-pointer"
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
                      Click to summarize
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
