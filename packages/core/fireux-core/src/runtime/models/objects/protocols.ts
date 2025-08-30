export interface BaseObject { 
  id: string
  createdAt?: number
  updatedAt?: number 
}

export interface WithAuthor { 
  authorId: string 
}

export interface Sluggable {
  slug: string
}
