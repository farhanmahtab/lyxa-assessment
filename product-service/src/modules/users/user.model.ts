import { prop, modelOptions } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: { 
    timestamps: true,
  },
})
export class User {
  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  authId!: string; // The _id from the auth service
}
