import helmet from 'helmet'
import express, { NextFunction, Request, Response } from 'express'
import { expressjwt, UnauthorizedError } from 'express-jwt'
import { customResponse } from 'middlewares/customResponse'
import { statusCodes } from 'constants/statusCodes'
import { ExpressExtends } from 'Types/interfaces'

interface CustomError extends UnauthorizedError {
  code: string
}

const unprotectedPaths = [
  /^\/_ah\/.*$/,
  '/',
  '/favicon.ico',
  /^\/api\/login\/?$/,
  /^\/api\/register\/?$/,
  /^\/api\/getExplorePosts\/?$/,
  /^\/api\/getSearchPosts\/?$/,
  /^\/api\/getTrendingPosts\/?$/,
  /^\/api\/getSinglePost\/.*\/?$/,
  /^\/api\/getLinkDetails\/.*\/?$/,
  /^\/api\/getPostReplies\/.*\/?$/,
  /^\/api\/getExploreTopics\/?$/,
  /^\/api\/getPopularTopics\/?$/,
  /^\/api\/getAllTopics\/?$/,
  /^\/api\/getAllPostsByTopic\/?$/,
  /^\/api\/translatePost\/.*\/?$/,
  /^\/api\/addToWaitlist\/?$/,
  /^\/api\/invite-check\/?$/,
  /^\/api\/send-resetpassword-link\/?$/,
  /^\/api\/change-user-password\/?$/,
  /^\/api\/getPublicProfile\/.*\/?$/,
  /^\/api\/getPublicPosts\/.*\/?$/
]

export default (app: ExpressExtends): void | Response => {
  try {
    app.use(
      expressjwt({
        secret: process.env.JWT_SECRET || '',
        algorithms: ['HS256']
      }).unless({
        // we have no JWT in login/signup etc. routes
        // so we tell app not to try auth with JWT
        path: unprotectedPaths
      })
    )
    app.use(function (
      err: CustomError,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      if (err && err.name === 'UnauthorizedError') {
        res
          .status(statusCodes.FORBIDDEN)
          .json({ error: 'Unauthorized', status: err.code })
      } else {
        next()
      }
    })

    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true, limit: '50mb' }))
    app.use(customResponse)
    app.use(helmet()) // for some out of the box security
  } catch (e) {
    console.log('Middleware error: ', e)
  }
}
