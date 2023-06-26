import cron from 'node-cron'
import { Post } from 'models'

// run every 10 mins
cron.schedule('*/10 * * * *', async () => {
  // eslint-disable-next-line no-console
  console.log('[CRON]: Calculating post reputation')

  await Post.updateMany({}, [
    {
      $set: {
        // calculate reputation
        // [Formula] new reputation =
        //        (0.98 * old reputation) +
        //        (0.9 *
        //            (total weighted upvotes after last cron run - total weighted downvotes after last cron run)
        //        )
        reputation: {
          $cond: {
            if: { $gte: ['$reputation', 0.1] },
            then: {
              $add: [
                { $multiply: [0.98, '$reputation'] },
                {
                  $multiply: [
                    0.9,
                    {
                      $subtract: [
                        '$lastUpvotesWeight',
                        '$lastDownvotesWeight'
                      ]
                    }
                  ]
                }
              ]
            },
            else: 0
          }
        },
        // set the votes weight back to 0
        lastUpvotesWeight: 0,
        lastDownvotesWeight: 0
      }
    }
  ])
})
