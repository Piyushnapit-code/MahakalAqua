import { useMemo, useState } from 'react';
import { MessageCircle, PhoneCall, X } from 'lucide-react';
import config from '../../config/env';
import { extractFirstPhoneNumber, toTelHref, toWhatsAppHref } from '../../lib/phone';

export default function ContactChatWidget() {
  const [open, setOpen] = useState(false);

  const phone = useMemo(() => extractFirstPhoneNumber(config.company.phone), []);

  if (!phone) return null;

  const whatsappHref = toWhatsAppHref(config.company.phone, 'Hi! I want to know about RO services.');
  const callHref = toTelHref(config.company.phone) || `tel:${phone}`;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[260px] rounded-2xl shadow-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
            <div className="text-sm font-semibold text-gray-900">Need help?</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between w-full px-3 py-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-sm font-medium">WhatsApp Chat</div>
                </div>
                <span className="text-xs font-semibold">Open</span>
              </a>
            )}

            <a
              href={callHref}
              className="flex items-center justify-between w-full px-3 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5" />
                <div className="text-sm font-medium">Call Now</div>
              </div>
              <span className="text-xs font-semibold">{phone}</span>
            </a>

            <div className="text-[11px] text-gray-500">
              We usually reply quickly on WhatsApp.
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full shadow-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
        aria-label={open ? 'Close chat options' : 'Open chat options'}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}


