import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubredditValidator } from '@/lib/validators/subreddit'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    //Checking if the user is authorized
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    //Like: const body = await req.body 
    const body = await req.json()

    //SubredditValidator will automatically validate and throw error if body is not valid
    const { name } = SubredditValidator.parse(body)

    // check if subreddit already exists
    const subredditExists = await db.subreddit.findFirst({
      where: {
        name,
      },
    })

    if (subredditExists) {
      return new Response('Subreddit already exists', { status: 409 })
    }

    // create subreddit and associate it with the user
    const subreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed (Owner must be subscribed to this subreddit)
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    })

    return new Response(subreddit.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
        //If true means the parsing failed and wrong data was passed in the route.
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not create subreddit', { status: 500 })
  }
}
