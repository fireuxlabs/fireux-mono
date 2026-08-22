import { defineEventHandler, getQuery } from 'h3'
import { readPortfolioDirectoryPage } from '../../../portfolio/server/index/read'

export default defineEventHandler(event => readPortfolioDirectoryPage(getQuery(event).cursor))
