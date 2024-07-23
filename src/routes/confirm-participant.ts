import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { ClientError } from '../errors/client-error'
import { env } from '../env'

export async function confirmParticipants(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/participants/:participantId/confirm',
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
          
        }),
        body: z.object({
          name: z.string().uuid(),
          email: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params
      const { name } = request.body
      const { email } = request.body

      console.log(name)
      console.log(email)

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
          name: name,
          email: email
        }
      })

      if (!participant) {
        throw new ClientError('Participant not found.')
      }

      if (participant.is_confirmed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { 
          name: name,
          email: email,
          is_confirmed: true 
        }
      })

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
    },
  )
}
