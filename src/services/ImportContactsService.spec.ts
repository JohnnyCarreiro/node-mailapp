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
      'contact@johnnycareiro.com\n',
      'johnny@johnnycarreiro.com\n',
      'jcarreiropublicidade@gmail.com\n'
    ])

    const importContactsService = new ImportContactsService()
    await importContactsService.run(contactsFileStream, ['Business Plan', 'Domain Driven Design'])

    const createdTags = await Tag.find({}).lean()

    expect(createdTags).toEqual([
      expect.objectContaining({ title: 'business plan' }),
      expect.objectContaining({ title: 'domain driven design' })
    ])

    const createdTagIds = createdTags.map(tag => tag._id)
    const createdContacts = await Contact.find({}).lean()

    expect(createdContacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'contact@johnnycareiro.com',
          tags: createdTagIds
        }),
        expect.objectContaining({
          email: 'johnny@johnnycarreiro.com',
          tags: createdTagIds
        }),
        expect.objectContaining({
          email: 'jcarreiropublicidade@gmail.com',
          tags: createdTagIds
        })
      ])
    )
  })
})
