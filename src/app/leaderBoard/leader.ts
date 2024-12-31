import { NextApiRequest, NextApiResponse } from 'next'
import { getAllRewards, getUserByEmail } from '@/app/actions/action'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { userEmail } = req.query

      if (typeof userEmail !== 'string') {
        return res.status(400).json({ error: 'Invalid user email.' })
      }

      const rewards = await getAllRewards()
      const user = await getUserByEmail(userEmail)

      res.status(200).json({ rewards, user })
    } catch (error) {
      console.error('Error fetching rewards and user:', error)
      res.status(500).json({ error: 'Failed to load leaderboard.' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
