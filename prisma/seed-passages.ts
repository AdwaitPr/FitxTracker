import { prisma } from "../src/lib/prisma";

const passages = [
    // ── Level 1: Simple ──
    {
        title: "Morning Routine",
        content: "The sun rises over the quiet town. Birds begin to sing their morning songs. A gentle breeze moves through the open window. The day feels calm and full of promise. Coffee brews in the kitchen, filling the room with a warm, familiar scent.",
        difficulty: 1,
        category: "prose",
    },
    {
        title: "Walking the Dog",
        content: "She takes her dog for a walk every evening. They follow the same path through the park. The dog sniffs every tree and chases after leaves. She enjoys the fresh air and the peaceful silence. It is their favorite part of the day.",
        difficulty: 1,
        category: "prose",
    },
    {
        title: "The Library",
        content: "The library is a quiet place. Rows of books line the walls from floor to ceiling. People sit at wooden tables reading in silence. A librarian helps a child find a book about animals. The clock on the wall ticks softly.",
        difficulty: 1,
        category: "prose",
    },
    {
        title: "Simple Numbers",
        content: "There are 12 months in a year and 7 days in a week. A minute has 60 seconds and an hour has 60 minutes. The number 100 is called a century. Half of 50 is 25. These basic facts help us understand time and counting.",
        difficulty: 1,
        category: "numeric",
    },

    // ── Level 2: Moderate ──
    {
        title: "The Art of Focus",
        content: "Sustained attention is the foundation of deep work. When we focus without interruption, our minds enter a state of flow where complex problems become manageable. Research suggests that the average person can maintain peak concentration for approximately 25 to 45 minutes before requiring a brief recovery period. Understanding these cognitive rhythms allows us to structure our work more effectively.",
        difficulty: 2,
        category: "prose",
    },
    {
        title: "Cognitive Load Theory",
        content: "Working memory has a limited capacity, typically holding between 5 and 9 chunks of information simultaneously. When cognitive load exceeds this threshold, performance degrades rapidly. Intrinsic load relates to the complexity of the material itself, while extraneous load stems from poor instructional design. Germane load represents the mental effort dedicated to building lasting schemas and mental models.",
        difficulty: 2,
        category: "technical",
    },
    {
        title: "Sleep Architecture",
        content: "Human sleep follows a predictable architecture of 4 to 6 cycles per night, each lasting roughly 90 minutes. Each cycle progresses through stages: N1 light sleep, N2 intermediate sleep with sleep spindles, N3 deep slow-wave sleep crucial for physical recovery, and REM sleep essential for memory consolidation. Disrupting these cycles through irregular schedules or environmental factors significantly impairs next-day cognitive performance.",
        difficulty: 2,
        category: "technical",
    },
    {
        title: "Compound Interest",
        content: "An investment of $10,000 at 7.5% annual interest compounded monthly grows to $10,776.33 after one year. After 5 years, the balance reaches $14,528.91. The formula A = P(1 + r/n)^(nt) governs this growth, where P is principal, r is annual rate, n is compounding frequency, and t is time in years. Einstein reportedly called compound interest the eighth wonder of the world.",
        difficulty: 2,
        category: "numeric",
    },

    // ── Level 3: Complex ──
    {
        title: "Neuroplasticity Mechanisms",
        content: "Neuroplasticity encompasses both structural and functional reorganization of neural circuits in response to experience. Long-term potentiation (LTP) at glutamatergic synapses involves NMDA receptor activation, calcium influx, and subsequent AMPA receptor trafficking to the postsynaptic density. Brain-derived neurotrophic factor (BDNF) modulates synaptic plasticity through TrkB receptor signaling cascades, influencing dendritic spine morphogenesis and axonal branching. These molecular mechanisms underpin the brain's remarkable capacity for adaptation throughout the lifespan.",
        difficulty: 3,
        category: "technical",
    },
    {
        title: "Quantum Coherence",
        content: "Quantum decoherence describes the process by which a quantum system loses its coherent superposition through interaction with its environment. The density matrix formalism, represented as ρ = Σᵢ pᵢ|ψᵢ⟩⟨ψᵢ|, captures this transition from pure to mixed states. Environmental coupling constants determine decoherence timescales, typically on the order of femtoseconds for macroscopic objects at room temperature. Understanding these phenomena is critical for quantum error correction protocols in nascent quantum computing architectures.",
        difficulty: 3,
        category: "technical",
    },
    {
        title: "Economic Complexity",
        content: "The Hausmann-Hidalgo Economic Complexity Index quantifies the productive knowledge embedded in a country's export basket. Nations with diversified, non-ubiquitous export profiles—such as Japan (ECI ≈ 2.26), Switzerland (ECI ≈ 2.17), and South Korea (ECI ≈ 1.87)—demonstrate sophisticated capabilities. The product space topology reveals that strategic diversification into nearby, higher-complexity products yields GDP per capita convergence rates 3.2× faster than commodity-dependent trajectories.",
        difficulty: 3,
        category: "technical",
    },
    {
        title: "Cryptographic Hashing",
        content: "SHA-256 produces a 256-bit (32-byte) digest from arbitrary-length input through 64 rounds of bitwise operations: Ch(e,f,g) = (e AND f) XOR (NOT e AND g), Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c). The compression function processes 512-bit message blocks using 8 working variables initialized from the previous block's hash. Collision resistance requires approximately 2^128 operations, making brute-force attacks computationally infeasible with current hardware.",
        difficulty: 3,
        category: "numeric",
    },
];

async function seedPassages() {
    console.log("🔤 Seeding CogniType text passages...");

    for (const passage of passages) {
        const wordCount = passage.content.split(/\s+/).length;
        await prisma.textPassage.upsert({
            where: {
                id: passage.title.toLowerCase().replace(/\s+/g, "-"),
            },
            update: {
                content: passage.content,
                difficulty: passage.difficulty,
                wordCount,
                category: passage.category,
            },
            create: {
                id: passage.title.toLowerCase().replace(/\s+/g, "-"),
                title: passage.title,
                content: passage.content,
                difficulty: passage.difficulty,
                wordCount,
                category: passage.category,
            },
        });
    }

    console.log(`✅ Seeded ${passages.length} passages`);
}

seedPassages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
