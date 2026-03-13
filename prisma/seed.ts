import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

//const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123456", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@tourreply.com" },
    update: {},
    create: {
      name: "Alex Rivera",
      email: "demo@tourreply.com",
      password: hashedPassword,
    },
  });

  // Create hotel
  const hotel = await prisma.hotel.upsert({
    where: { id: "hotel_demo_001" },
    update: {},
    create: {
      id: "hotel_demo_001",
      name: "Villa Serenity Bali",
      location: "Ubud, Bali, Indonesia",
      phone: "+62 812 3456 7890",
      email: "info@villaserenity.com",
      currency: "USD",
      ownerId: user.id,
    },
  });

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: "room_001" },
      update: {},
      create: {
        id: "room_001",
        name: "Garden Villa Suite",
        type: "suite",
        price: 180,
        capacity: 2,
        description: "Stunning garden view suite with private pool",
        amenities: ["Private Pool", "AC", "WiFi", "Breakfast", "King Bed"],
        hotelId: hotel.id,
      },
    }),
    prisma.room.upsert({
      where: { id: "room_002" },
      update: {},
      create: {
        id: "room_002",
        name: "Deluxe Rice Field View",
        type: "deluxe",
        price: 120,
        capacity: 2,
        description: "Romantic room overlooking terraced rice fields",
        amenities: ["AC", "WiFi", "Breakfast", "Queen Bed", "Balcony"],
        hotelId: hotel.id,
      },
    }),
    prisma.room.upsert({
      where: { id: "room_003" },
      update: {},
      create: {
        id: "room_003",
        name: "Standard Jungle Room",
        type: "standard",
        price: 80,
        capacity: 2,
        description: "Cozy room surrounded by tropical jungle",
        amenities: ["AC", "WiFi", "Double Bed"],
        hotelId: hotel.id,
      },
    }),
    prisma.room.upsert({
      where: { id: "room_004" },
      update: {},
      create: {
        id: "room_004",
        name: "Family Pool Villa",
        type: "villa",
        price: 350,
        capacity: 6,
        description: "Spacious family villa with large private pool",
        amenities: [
          "Private Pool",
          "AC",
          "WiFi",
          "Breakfast",
          "3 Bedrooms",
          "Kitchen",
        ],
        hotelId: hotel.id,
      },
    }),
  ]);

  // Create FAQs
  await Promise.all([
    prisma.fAQ.upsert({
      where: { id: "faq_001" },
      update: {},
      create: {
        id: "faq_001",
        question: "What is the check-in and check-out time?",
        answer:
          "Check-in is at 2:00 PM and check-out is at 12:00 PM (noon). Early check-in and late check-out may be available upon request.",
        keywords: ["check-in", "checkin", "check-out", "checkout", "time"],
        hotelId: hotel.id,
      },
    }),
    prisma.fAQ.upsert({
      where: { id: "faq_002" },
      update: {},
      create: {
        id: "faq_002",
        question: "Do you offer airport transfer?",
        answer:
          "Yes! We offer airport transfers from Ngurah Rai International Airport. The transfer costs $35 USD one-way. Please let us know your flight details and we'll arrange everything.",
        keywords: ["airport", "transfer", "pickup", "taxi", "transport"],
        hotelId: hotel.id,
      },
    }),
    prisma.fAQ.upsert({
      where: { id: "faq_003" },
      update: {},
      create: {
        id: "faq_003",
        question: "Is breakfast included?",
        answer:
          "Breakfast is included in our Deluxe and Suite rooms. For Standard rooms, breakfast can be added for $15 USD per person per day. We serve a mix of Balinese and Western breakfast from 7:00 AM to 10:00 AM.",
        keywords: [
          "breakfast",
          "food",
          "meal",
          "included",
          "morning",
          "eat",
        ],
        hotelId: hotel.id,
      },
    }),
    prisma.fAQ.upsert({
      where: { id: "faq_004" },
      update: {},
      create: {
        id: "faq_004",
        question: "What are your room prices?",
        answer:
          "Our room prices are: Standard Jungle Room from $80/night, Deluxe Rice Field View from $120/night, Garden Villa Suite from $180/night, and Family Pool Villa from $350/night. All prices include taxes.",
        keywords: [
          "price",
          "cost",
          "rate",
          "how much",
          "tariff",
          "charge",
          "fee",
        ],
        hotelId: hotel.id,
      },
    }),
    prisma.fAQ.upsert({
      where: { id: "faq_005" },
      update: {},
      create: {
        id: "faq_005",
        question: "Where are you located?",
        answer:
          "We're located in the heart of Ubud, Bali, just 5 minutes from Ubud Palace and Ubud Art Market. Our address is Jl. Raya Ubud No. 88, Ubud, Gianyar, Bali 80571.",
        keywords: [
          "location",
          "address",
          "where",
          "directions",
          "map",
          "ubud",
        ],
        hotelId: hotel.id,
      },
    }),
  ]);

  // Create sample guests
  const guests = await Promise.all([
    prisma.guest.upsert({
      where: { id: "guest_001" },
      update: {},
      create: {
        id: "guest_001",
        name: "Sarah Johnson",
        phone: "+1 555 234 5678",
        country: "United States",
        email: "sarah.j@email.com",
        hotelId: hotel.id,
      },
    }),
    prisma.guest.upsert({
      where: { id: "guest_002" },
      update: {},
      create: {
        id: "guest_002",
        name: "Marcus Weber",
        phone: "+49 176 1234 5678",
        country: "Germany",
        hotelId: hotel.id,
      },
    }),
    prisma.guest.upsert({
      where: { id: "guest_003" },
      update: {},
      create: {
        id: "guest_003",
        name: "Priya Sharma",
        phone: "+91 98765 43210",
        country: "India",
        email: "priya.sharma@email.com",
        hotelId: hotel.id,
      },
    }),
    prisma.guest.upsert({
      where: { id: "guest_004" },
      update: {},
      create: {
        id: "guest_004",
        name: "James Chen",
        phone: "+65 9123 4567",
        country: "Singapore",
        hotelId: hotel.id,
      },
    }),
  ]);

  // Create conversations and messages
  const conv1 = await prisma.conversation.upsert({
    where: { id: "conv_001" },
    update: {},
    create: {
      id: "conv_001",
      guestId: guests[0].id,
      hotelId: hotel.id,
      lastMessage: "That sounds perfect! Can I book the Garden Villa Suite?",
      status: "open",
    },
  });

  await prisma.message.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "msg_001",
        conversationId: conv1.id,
        sender: "guest",
        content: "Hi! I'm interested in staying at your villa in Bali.",
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "msg_002",
        conversationId: conv1.id,
        sender: "system",
        content:
          "Welcome to Villa Serenity Bali! 🌿 I'm happy to help you plan your perfect Bali getaway. We have beautiful rooms starting from $80/night. What dates are you looking at?",
        createdAt: new Date(Date.now() - 3600000 * 2 + 30000),
      },
      {
        id: "msg_003",
        conversationId: conv1.id,
        sender: "guest",
        content:
          "We're planning to visit from March 15 to March 20. Two adults.",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: "msg_004",
        conversationId: conv1.id,
        sender: "hotel",
        content:
          "Great news! We have availability for those dates. Our Garden Villa Suite would be perfect for 2 adults at $180/night, total $900 for 5 nights. It includes a private pool and daily breakfast! 🏊‍♀️",
        createdAt: new Date(Date.now() - 3600000 + 60000),
      },
      {
        id: "msg_005",
        conversationId: conv1.id,
        sender: "guest",
        content:
          "That sounds perfect! Can I book the Garden Villa Suite?",
        createdAt: new Date(Date.now() - 1800000),
      },
    ],
  });

  const conv2 = await prisma.conversation.upsert({
    where: { id: "conv_002" },
    update: {},
    create: {
      id: "conv_002",
      guestId: guests[1].id,
      hotelId: hotel.id,
      lastMessage: "Do you have airport pickup service?",
      status: "open",
    },
  });

  await prisma.message.createMany({
    skipDuplicates: true,
    data: [
      {
        id: "msg_006",
        conversationId: conv2.id,
        sender: "guest",
        content: "Hallo! Do you have airport pickup service?",
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: "msg_007",
        conversationId: conv2.id,
        sender: "system",
        content:
          "Yes! We offer airport transfers from Ngurah Rai International Airport. The transfer costs $35 USD one-way. Please let us know your flight details and we'll arrange everything.",
        createdAt: new Date(Date.now() - 7200000 + 30000),
      },
    ],
  });

  // Create sample bookings
  await prisma.booking.upsert({
    where: { id: "booking_001" },
    update: {},
    create: {
      id: "booking_001",
      guestId: guests[0].id,
      roomId: rooms[0].id,
      checkIn: new Date("2024-03-15"),
      checkOut: new Date("2024-03-20"),
      guests: 2,
      status: "confirmed",
      paymentStatus: "paid",
      totalAmount: 900,
      depositAmount: 270,
      source: "whatsapp",
    },
  });

  await prisma.booking.upsert({
    where: { id: "booking_002" },
    update: {},
    create: {
      id: "booking_002",
      guestId: guests[1].id,
      roomId: rooms[1].id,
      checkIn: new Date("2024-03-18"),
      checkOut: new Date("2024-03-23"),
      guests: 2,
      status: "requested",
      paymentStatus: "pending",
      totalAmount: 600,
      source: "whatsapp",
    },
  });

  await prisma.booking.upsert({
    where: { id: "booking_003" },
    update: {},
    create: {
      id: "booking_003",
      guestId: guests[2].id,
      roomId: rooms[2].id,
      checkIn: new Date("2024-04-01"),
      checkOut: new Date("2024-04-05"),
      guests: 2,
      status: "inquiry",
      paymentStatus: "pending",
      totalAmount: 320,
      source: "whatsapp",
    },
  });

  await prisma.booking.upsert({
    where: { id: "booking_004" },
    update: {},
    create: {
      id: "booking_004",
      guestId: guests[3].id,
      roomId: rooms[3].id,
      checkIn: new Date("2024-03-25"),
      checkOut: new Date("2024-03-30"),
      guests: 4,
      status: "interested",
      paymentStatus: "pending",
      totalAmount: 1750,
      source: "whatsapp",
    },
  });

  console.log("✅ Seed completed!");
  console.log("\n📧 Demo credentials:");
  console.log("   Email: demo@tourreply.com");
  console.log("   Password: demo123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
