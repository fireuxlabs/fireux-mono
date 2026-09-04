import { defineEventHandler } from 'h3'
import { executeUserDeletion } from '../../../../user/server/deletion'

export default defineEventHandler((event) => executeUserDeletion(event))
