import { Document, Schema, model } from 'mongoose'

type Tag = Document & {
  title: string
}

export const TagSchema = new Schema(
  {
    title: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model<Tag>('Tag', TagSchema)
