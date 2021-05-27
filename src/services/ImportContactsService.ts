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

    console.log('existingTagsTitle:', existingTagsTitle)
    const newTagsData = tags
      .map(tag => tag.toLowerCase())
      .filter(tag => !existingTagsTitle.includes(tag))
      .map(tag => ({ title: tag }))

    console.log('newTagsData:', newTagsData)

    const createdTags = await Tag.create(newTagsData)
    const tagIds = createdTags.map(tag => tag._id)

    parseCsv.on('data', async line => {
      const [email] = line

      await Contact.create({ email, tags: tagIds })
    })

    await new Promise(resolve => parseCsv.on('end', resolve))
  }
}
