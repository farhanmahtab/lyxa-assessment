import { prop, modelOptions, Severity } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
  options: { allowMixed: Severity.ALLOW }
})
export class User {
  @prop({ required: true })
  name: string;

  @prop({ required: true, unique: true, index: true })
  email: string;

  @prop({ required: true, select: false })
  password: string;

  @prop({ default: 'user' })
  role: string;
}
