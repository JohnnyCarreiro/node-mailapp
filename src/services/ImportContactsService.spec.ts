import mongoose from 'mongoose'
import { Readable } from 'stream'

import { ImportContactsService } from '@services/ImportContactsService'

import Contact from '@schemas/Contact'
import Tag from '@schemas/Tag'

describe('ImportContacts', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URL) {
      throw new Error('MongoDB server not initialized')
    }

    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    await Contact.deleteMany({})
    await Tag.deleteMany({})
  })

  it('should be able to import new contacts', async () => {
    const contactsFileStream = Readable.from([
      'contact@johnnycareiro.com',
      'johnny@johnnycarreiro.com',
      'jcarreiropublicidade@gmail.com'
    ])

    const importContactsService = new ImportContactsService()
    importContactsService.run(contactsFileStream, ['Business Plan', 'Domain Driven Design'])

    const createdTags = await Tag.find({})

    expect(createdTags).toEqual([
      expect.objectContaining({ title: 'Business Plan' }),
      expect.objectContaining({ title: 'Domain Driven Design' })
    ])
  })
})
