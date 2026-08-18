export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name}***@${domain}`;
  const maskedName = `${name.substring(0, 2)}${'*'.repeat(name.length - 2)}`;
  return `${maskedName}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 10) return phone;
  const maskedLength = phone.length - 4;
  return `${phone.substring(0, 3)}${'*'.repeat(maskedLength - 3)}${phone.substring(phone.length - 4)}`;
};

export const maskDocument = (document: string): string => {
  if (!document || document.length < 5) return document;
  return `${'*'.repeat(document.length - 4)}${document.substring(document.length - 4)}`;
};
