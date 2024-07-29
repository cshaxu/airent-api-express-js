import { Awaitable } from '@airent/api';
// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-sources/context.js';

// entity imports
import { MessageEntity } from './message.js';
import {
  UserFieldRequest,
  UserResponse,
  SelectedUserResponse,
  UserModel,
} from './generated/user-type.js';
import { UserEntityBase } from './generated/user-base.js';

/** @deprecated */
export class UserEntity extends UserEntityBase {
  protected initialize(model: UserModel, context: Context) {
    super.initialize(model, context);

    /** associations */

    this.messagesLoadConfig.loader = async (keys: LoadKey[]) => {
      const models = [/* TODO: load MessageEntity models */];
      return MessageEntity.fromArray(models, this.context);
    };
  }

  protected authorizePrivate(): Awaitable<boolean> {
    throw new Error('not implemented');
  }
}
