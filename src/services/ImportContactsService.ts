import { Readable } from 'stream'
import csvParse from 'csv-parse'

import Contact from '@schemas/Contact'
import Tag from '@schemas/Tag'

export class ImportContactsService {
  async run(contactsFileStrem: Readable, tags: string[]): Promise<void> {
    const parsers = csvParse({
      delimiter: ';'
    })
    const parseCsv = contactsFileStrem.pipe(parsers)

    const existingTags = await Tag.find({
      title: {
        $in: tags
      }
    })

    const existingTagsTitle = existingTags.map(tag => (tag.title))

    const newTagsData = tags
      .map(tag => tag.toLowerCase())
      .filter(tag => !existingTagsTitle.includes(tag))
      .map(tag => ({ title: tag }))

    const createdTags = await Tag.create(newTagsData)
    const tagIds = createdTags.map(tag => tag._id)

    parseCsv.on('data', async line => {
      const [email] = line

      await Contact.findOneAndUpdate(
        { email },
        { $addToSet: { tags: tagIds } },
        { upsert: true }
      )
    })

    await new Promise(resolve => parseCsv.on('end', resolve))
  }
}
