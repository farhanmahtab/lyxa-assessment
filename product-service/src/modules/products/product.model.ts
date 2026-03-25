import { prop, modelOptions } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

@modelOptions({
  schemaOptions: { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
})
export class Product {
  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  description!: string;

  @prop({ required: true, min: 0 })
  price!: number;

  @prop({ required: true, index: true })
  ownerId!: string;
}
