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

    const tagsData = tags.map(tag => ({
      title: tag
    }))
    const createdTags = await Tag.create(tagsData)
    const tagIds = createdTags.map(tag => tag._id)

    parseCsv.on('data', async line => {
      const [email] = line

      await Contact.create({ email, tags: tagIds })
    })

    await new Promise(resolve => parseCsv.on('end', resolve))
  }
}
