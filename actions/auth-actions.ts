"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  hotelName: z.string().min(2),
  hotelLocation: z.string().min(2),
});

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { error: "Invalid email or password format" };
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email },
    include: { hotels: { take: 1 } },
  });

  if (!user) {
    return { error: "No account found with this email" };
  }

  const passwordMatch = await bcrypt.compare(result.data.password, user.password);
  if (!passwordMatch) {
    return { error: "Incorrect password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.hotelId = user.hotels[0]?.id;
  session.isLoggedIn = true;
  await session.save();

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    hotelName: formData.get("hotelName") as string,
    hotelLocation: formData.get("hotelLocation") as string,
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { error: "Please fill all fields correctly" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
      hotels: {
        create: {
          name: result.data.hotelName,
          location: result.data.hotelLocation,
        },
      },
    },
    include: { hotels: true },
  });

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.hotelId = user.hotels[0]?.id;
  session.isLoggedIn = true;
  await session.save();

  redirect("/dashboard");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
