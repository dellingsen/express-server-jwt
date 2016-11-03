
exports.need_password_reset = {
  secret: 'XXX: insert real need_password_reset secret here',
  options: {
    expiresIn: '1h'
  }
}

exports.user = {
  secret: 'XXX: something',
  options: {
    expiresIn: '7d'
  }
}

exports.root = {
  secret: 'XXX: super secret',
  options: {
    expiresIn: '3d'
  }
}
