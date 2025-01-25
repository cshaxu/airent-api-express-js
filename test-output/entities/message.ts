import { Awaitable } from '@airent/api';
// airent imports
import { LoadKey, toArrayMap, toObjectMap } from 'airent';

// config imports
import { Context } from '../../test-sources/context.js';

// entity imports
import {
  MessageFieldRequest,
  MessageResponse,
  SelectedMessageResponse,
  MessageModel,
} from '../generated/types/message.js';
import { MessageEntityBase } from '../generated/entities/message.js';

export class MessageEntity extends MessageEntityBase {
}
