import { PayPayError, type Anyone, type ResponseBalance, type ResponseCreateLink, type ResponseGetLink, type ResponseReceiveLink, type ResponseUserInfo, isSuccess } from '..'

export function parseCookieFromMap(map: Map<string, string>): string {
  return Array.from(map.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}

export const recoveryPrefix = 'eyJhbGc'

export function parseRecoveryCode(phone: string, password: string, uuid: string): string {
  const encode = (string: string): string => {
    return btoa(encodeURIComponent(string))
  }
  return `${recoveryPrefix}${encode(phone)}.${encode(password)}.${encode(uuid)}`
}

export function unparseRecoveryCode(recoveryCode: string): {
  phone: string
  password: string
  uuid: string
} {
  const decode = (string: string): string => {
    console.log(string)
    return decodeURIComponent(atob(string))
  }

  if (!recoveryCode.startsWith(recoveryPrefix)) {
    throw new PayPayError('Invalid recovery code', 2).fire()
  }

  const cache = recoveryCode.replace(recoveryPrefix, '').split('.')

  if (cache.length !== 3) {
    throw new PayPayError('Invalid recovery code', 3).fire()
  }

  const [phone, password, uuid] = cache

  return {
    phone: decode(phone),
    password: decode(password),
    uuid: decode(uuid),
  }
}

export function parseBalanceContext(result: Anyone): ResponseBalance {
  return {
    success: isSuccess(result),
    total: result.payload.walletSummary.allTotalBalanceInfo.balance,
    currency: result.payload.walletSummary.allTotalBalanceInfo.currency,
    updated_at: result.payload.updatedAt,
    raw: result,
  }
}

export function parseUserInfoContext(result: Anyone): ResponseUserInfo {
  return {
    success: isSuccess(result),
    id: result.payload.id,
    user_id: result.payload.user_defined_id ?? 'unknown',
    state: result.payload.state,
    first_name: result.payload.first_name,
    last_name: result.payload.last_name,
    display_name: result.payload.display_name,
    icon_url: result.payload.photo_url,
    phone_number: result.payload.mobile,
    email: result.payload.email,
    date_of_birth: result.payload.date_of_birth,
    external_id: result.payload.external_id,
    raw: result,
  }
}

export function parseCreateLink(result: Anyone): ResponseCreateLink {
  return {
    success: isSuccess(result),
    orderId: result.payload.orderId,
    orderStatus: result.payload.orderStatus,
    link: result.payload.link,
    transactionAt: result.payload.transactionAt,
    expiry: result.payload.expiry,
    raw: result,
  }
}

export function parseGetLink(result: Anyone): ResponseGetLink {
  if (!('pendingP2PInfo' in result.payload)) {
    return {
      success: false,
      orderId: '',
      orderType: '',
      description: '',
      imageUrl: '',
      amount: 0,
      link: '',
      isSetPasscode: false,
      createdAt: '',
      acceptedAt: '',
      money_type: '',
      sender_name: '',
      sender_external_id: '',
      photo_url: '',
      raw: result,
    }
  }

  return {
    success: isSuccess(result),
    orderId: result.payload.pendingP2PInfo.orderId,
    orderType: result.payload.pendingP2PInfo.orderType,
    description: result.payload.pendingP2PInfo.description,
    imageUrl: result.payload.pendingP2PInfo.imageUrl,
    amount: result.payload.pendingP2PInfo.amount,
    link: result.payload.pendingP2PInfo.link,
    isSetPasscode: result.payload.pendingP2PInfo.isSetPasscode,
    createdAt: result.payload.pendingP2PInfo.createdAt,
    acceptedAt: result.payload.pendingP2PInfo.acceptedAt,
    money_type: result.payload.pendingP2PInfo.moneyPriorit,
    sender_name: result.payload.sender.displayName,
    sender_external_id: result.payload.sender.externalId,
    photo_url: result.payload.sender.photoUrl,
    raw: result,
  }
}

export function parseReceiveLink(result: Anyone): ResponseReceiveLink {
  return {
    success: isSuccess(result),
    messageId: result.payload.messageId,
    chatRoomId: result.payload.chatRoomId,
    orderStatus: result.payload.orderStatus,
    raw: result,
  }
}