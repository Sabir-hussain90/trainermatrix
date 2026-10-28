import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.conversation.findMany({
      include: {
        profile: true,
        trainer: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: { profile: true, trainer: true, messages: true },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async create(body: any) {
    const conversation = await this.prisma.conversation.create({
      data: {
        profileId: body.profileId,
        trainerId: body.trainerId,
        status: 'ACTIVE',
        lastMessage: body.message,
        unread: true,
        messages: {
          create: {
            senderName: body.senderName || 'Trainer',
            body: body.message,
          },
        },
      },
      include: { profile: true, trainer: true, messages: true },
    });
    return conversation;
  }

  async reassign(id: string, newTrainerId: string) {
    await this.findOne(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { trainerId: newTrainerId },
      include: { profile: true, trainer: true },
    });
  }

  async markRead(id: string) {
    await this.findOne(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { unread: false },
      include: {
        profile: true,
        trainer: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async markAllRead() {
    const result = await this.prisma.conversation.updateMany({
      where: { unread: true },
      data: { unread: false },
    });
    return { updated: result.count };
  }

  async addMessage(
    conversationId: string,
    body: { senderName?: string; body: string },
  ) {
    await this.findOne(conversationId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderName: body.senderName || 'Trainer',
          body: body.body,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: body.body,
          unread: true,
          updatedAt: new Date(),
        },
      }),
    ]);

    return message;
  }
}