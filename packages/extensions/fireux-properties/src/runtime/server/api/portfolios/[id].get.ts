import { defineEventHandler, getRouterParam } from 'h3'
import { readPortfolioDetail } from '../../../portfolio/server/index/read'

export default defineEventHandler(event => readPortfolioDetail(getRouterParam(event, 'id')))
