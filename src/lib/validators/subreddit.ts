import { z } from 'zod'

export const SubredditValidator = z.object({
  name: z.string().min(3).max(21),
})
//It is to valid the payload we are going to deal with. 

export const SubredditSubscriptionValidator = z.object({
  subredditId: z.string(),
})

export type CreateSubredditPayload = z.infer<typeof SubredditValidator>
export type SubscribeToSubredditPayload = z.infer<
  typeof SubredditSubscriptionValidator
>


