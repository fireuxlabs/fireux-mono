import { defineEventHandler } from 'h3'
import { serveLiveProjectionFeed } from '../utils/live-projection-feed'

export default defineEventHandler(serveLiveProjectionFeed)
