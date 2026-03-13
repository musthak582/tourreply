'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

type NotificationType = 'message' | 'booking' | 'payment'

export async function createNotification(params: {
  userId: string
  type: NotificationType
  title: string
  description: string
}) {
  const { userId, type, title, description } = params

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      description,
    },
  })
}

export async function getNotifications() {
  const session = await getSession()
  if (!session) return []

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
}

export async function markNotificationAsRead(id: string) {
  const session = await getSession()
  if (!session) return { success: false }

  await prisma.notification.updateMany({
    where: {
      id,
      userId: session.user.id,
    },
    data: { read: true },
  })

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const session = await getSession()
  if (!session) return { success: false }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  return { success: true }
}


