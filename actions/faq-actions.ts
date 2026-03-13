'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function getHotelIdForCurrentUser() {
  const session = await requireAuth()
  const hotel = await prisma.hotel.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!hotel) {
    throw new Error('Hotel not found for current user')
  }
  return hotel.id
}

export async function createFaq(formData: FormData) {
  const hotelId = await getHotelIdForCurrentUser()

  const question = String(formData.get('question') ?? '').trim()
  const answer = String(formData.get('answer') ?? '').trim()

  if (!question || !answer) {
    return { error: 'Question and answer are required' }
  }

  await prisma.fAQ.create({
    data: {
      hotelId,
      question,
      answer,
    },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function deleteFaq(formData: FormData) {
  const hotelId = await getHotelIdForCurrentUser()
  const id = String(formData.get('id') ?? '')

  if (!id) return { error: 'Missing FAQ id' }

  await prisma.fAQ.deleteMany({
    where: {
      id,
      hotelId,
    },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function createQuickReply(formData: FormData) {
  const hotelId = await getHotelIdForCurrentUser()

  const label = String(formData.get('label') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!label || !content) {
    return { error: 'Label and content are required' }
  }

  await prisma.quickReply.create({
    data: {
      hotelId,
      label,
      content,
    },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function deleteQuickReply(formData: FormData) {
  const hotelId = await getHotelIdForCurrentUser()
  const id = String(formData.get('id') ?? '')

  if (!id) return { error: 'Missing quick reply id' }

  await prisma.quickReply.deleteMany({
    where: {
      id,
      hotelId,
    },
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createFaq(hotelId: string, question: string, answer: string) {
  await requireAuth()

  const faq = await prisma.fAQ.create({
    data: {
      hotelId,
      question,
      answer,
    },
  })

  revalidatePath('/dashboard/settings')
  return faq
}

export async function updateFaq(id: string, question: string, answer: string) {
  await requireAuth()

  const faq = await prisma.fAQ.update({
    where: { id },
    data: { question, answer },
  })

  revalidatePath('/dashboard/settings')
  return faq
}

export async function deleteFaq(id: string) {
  await requireAuth()

  await prisma.fAQ.delete({
    where: { id },
  })

  revalidatePath('/dashboard/settings')
}

