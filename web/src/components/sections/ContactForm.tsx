'use client';

import { useId, useState, type FormEvent } from 'react';
import { PROJECT_TYPES, SITE } from '@/content/site';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Static hosting has no server code, so the form posts to a small PHP script that ships in /public. */
const ENDPOINT = '/contact.php';

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const uid = useId();
  const field = (name: string) => `${uid}-${name}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    if (!name || !EMAIL_PATTERN.test(email)) {
      setStatus({ kind: 'error', message: 'Please add your name and a valid email address.' });
      return;
    }

    setStatus({ kind: 'sending' });
    try {
      const response = await fetch(ENDPOINT, { method: 'POST', body: data });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setStatus({ kind: 'sent' });
      form.reset();
    } catch {
      setStatus({ kind: 'error', message: `We could not send your message. Please call ${SITE.phone} or email ${SITE.email}.` });
    }
  }

  return (
    <form className="form rv" onSubmit={onSubmit} noValidate>
      <div className="row2">
        <label htmlFor={field('name')}>
          Name
          <input id={field('name')} name="name" type="text" autoComplete="name" required />
        </label>
        <label htmlFor={field('phone')}>
          Phone
          <input id={field('phone')} name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <div className="row2">
        <label htmlFor={field('email')}>
          Email
          <input id={field('email')} name="email" type="email" autoComplete="email" required />
        </label>
        <label htmlFor={field('type')}>
          Project type
          <select id={field('type')} name="type" defaultValue={PROJECT_TYPES[0]}>
            {PROJECT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>
      <label htmlFor={field('message')}>
        Message
        <textarea id={field('message')} name="message" rows={2} />
      </label>
      {/* Hidden trap for spam bots; people never see or fill it. */}
      <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn" type="submit" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      <p className={status.kind === 'error' ? 'ok err' : 'ok'} role="status" aria-live="polite">
        {status.kind === 'sent' ? 'Thank you. Your message was sent and we will be in touch shortly.' : null}
        {status.kind === 'error' ? status.message : null}
      </p>
    </form>
  );
}
