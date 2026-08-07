import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Search, ChevronRight } from 'lucide-react';

export default function TermsAndConditionsModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const sections = [
    {
      id: '1',
      title: '1. Overview',
      content: `The ELESENE Brand Investment Program ("Program") is a customer recognition and loyalty program designed to reward customers for their continued support, purchases, and engagement with the ELESENE brand.

The Program consists of two independent point systems:
• Investment Points (IP) – Lifetime recognition points.
• Loyalty Points (LP) – Spendable reward points.

Participation in the Program constitutes acceptance of these Terms & Conditions.`
    },
    {
      id: '2',
      title: '2. Important Legal Notice',
      highlight: true,
      content: `The ELESENE Brand Investment Program is NOT a financial investment program.

Investment Points:
• Do not represent ownership in ELESENE.
• Do not represent shares or securities.
• Do not create any partnership or equity rights.
• Have no cash value.
• Cannot earn interest.
• Do not generate dividends.
• Cannot be sold, exchanged, or transferred.
• Cannot be converted into money or cryptocurrency.

The term "Investment" within this Program refers solely to a customer's lifetime contribution, participation, and engagement with the ELESENE brand.`
    },
    {
      id: '3',
      title: '3. Eligibility',
      content: `Participation is available to:
• Customers aged 18 years or older (or the legal age in their jurisdiction).
• Registered ELESENE account holders.
• Customers with a verified email address.
• Customers who comply with these Terms & Conditions.

ELESENE reserves the right to suspend, restrict, or terminate participation if fraud, abuse, or misuse of the Program is detected.`
    },
    {
      id: '4',
      title: '4. Investment Points (IP)',
      content: `Investment Points (IP) represent a customer's lifetime contribution and engagement with the ELESENE brand.

4.1 Earning Investment Points:
Customers may earn Investment Points through eligible activities including eligible purchases (₹1 = 1 IP), product reviews (+20 IP), successful referrals (+300 IP), profile completion (+50 IP), social engagement (+25 IP), and promotional campaigns.

4.2 Nature of Investment Points:
Investment Points never expire, cannot be redeemed, transferred, exchanged for cash, gifted, purchased, inherited, or converted into Loyalty Points.

4.3 Investment Tiers & Benefits:
IP determines your standing: Seed, Bronze, Silver, Gold, Platinum, Diamond. Higher tiers unlock early access, priority support, birthday rewards, and exclusive collection access.`
    },
    {
      id: '5',
      title: '5. Loyalty Points (LP)',
      content: `Loyalty Points (LP) are promotional reward points that may be redeemed through approved ELESENE channels.

5.1 Earning Loyalty Points:
₹100 Eligible Purchase = 1 LP. Additional LP may be awarded during festival campaigns, referral promotions, and marketing events.

5.2 Expiry & Redemption:
Loyalty Points may expire after the validity period communicated by ELESENE. LP may be redeemed for discount vouchers, promotional coupons, shipping benefits, and member rewards.

5.3 Independence:
Redeeming Loyalty Points does NOT reduce Investment Points, lifetime purchases, or Brand Tier standing.`
    },
    {
      id: '6',
      title: '6. Investment Journey',
      content: `Customers progress through Brand Investment Tiers based on cumulative Investment Points. Dashboard progress bars, estimated purchase values, and projected tier upgrades are provided for informational purposes only and do not constitute guarantees.`
    },
    {
      id: '7',
      title: '7. Referral Program',
      content: `Referral rewards are awarded only when the referred customer creates a valid ELESENE account, completes a qualifying purchase, and the purchase passes the return verification period. Self-referrals, duplicate accounts, and automated account creation are strictly prohibited.`
    },
    {
      id: '8',
      title: '8. Returns, Refunds & Cancellations',
      content: `If an order is cancelled, refunded, charged back, or determined to be fraudulent, ELESENE may reverse Loyalty Points, promotional Investment Points, and recalculate Lifetime Investment Amount based on qualifying purchases only.`
    },
    {
      id: '9',
      title: '9. Fraud Prevention',
      content: `ELESENE reserves the right to investigate suspected abuse including fake referrals, fake reviews, duplicate accounts, coupon abuse, or campaign manipulation. Accounts violating terms may lose rewards, points, or face permanent removal from the Program.`
    },
    {
      id: '10',
      title: '10. Account Responsibility',
      content: `Customers are responsible for maintaining account security and preventing unauthorized access. ELESENE is not responsible for rewards lost due to customer negligence.`
    },
    {
      id: '11',
      title: '11. Program Changes',
      content: `ELESENE reserves the right to modify earning rates, redemption values, tier thresholds, benefits, or terms & conditions at any time with reasonable notice where practical.`
    },
    {
      id: '12',
      title: '12. Campaign Rules',
      content: `Promotional campaigns may include specific start/end dates, multipliers, reward caps, and exclusions. Where campaign rules conflict with general Terms, campaign rules shall prevail.`
    },
    {
      id: '13',
      title: '13. Non-Transferability',
      content: `Points, tiers, and rewards cannot be transferred, sold, exchanged, pledged, inherited, or assigned to another customer.`
    },
    {
      id: '14',
      title: '14. Limitation of Liability',
      content: `ELESENE shall not be liable for system outages, technical interruptions, delayed point updates, campaign interruptions, or force majeure events. Point balances remain subject to audit verification.`
    },
    {
      id: '15',
      title: '15. Privacy',
      content: `Participation in the Program is governed by the ELESENE Privacy Policy. Customer activity is processed for reward calculation, fraud prevention, support, and analytics.`
    },
    {
      id: '16',
      title: '16. Intellectual Property',
      content: `All Program content including logos, branding, tier names, graphics, and reward names remain the exclusive intellectual property of ELESENE.`
    },
    {
      id: '17',
      title: '17. Program Suspension or Termination',
      content: `ELESENE reserves the right to suspend or discontinue the Program at any time with notice where practical.`
    },
    {
      id: '18',
      title: '18. Governing Law',
      content: `These Terms & Conditions shall be governed by and interpreted in accordance with applicable laws.`
    },
    {
      id: '19',
      title: '19. Contact Information',
      content: `For questions regarding the ELESENE Brand Investment Program:
ELESENE Customer Experience Team
Email: support@elesene.com`
    }
  ];

  const filteredSections = sections.filter(
    s => s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-2xl text-stone-900 font-futura"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700 border border-amber-200">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold tracking-wide text-stone-900">
                  ELESENE Brand Investment Program
                </h2>
                <p className="text-xs text-stone-500">Official Terms & Conditions • Version 1.0</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
              aria-label="Close Terms"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Legal Disclaimer Alert Box */}
          <div className="my-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 shrink-0 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold uppercase tracking-wider block text-[11px] text-amber-800">
                Legal Notice & Program Policy
              </strong>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Investment Points (IP) represent customer recognition and engagement only. IP does <strong>NOT</strong> constitute a financial investment, shares, securities, partnership, or equity. Points have no cash value and earn no interest or dividends.
              </p>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Terms & Conditions sections..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs text-stone-900 focus:border-amber-500 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Scrollable Terms Content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs leading-relaxed text-stone-700">
            {filteredSections.length > 0 ? (
              filteredSections.map((sec) => (
                <div
                  key={sec.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    sec.highlight
                      ? 'border-amber-300 bg-amber-50/40 shadow-2xs'
                      : 'border-stone-200/90 bg-stone-50/40'
                  }`}
                >
                  <h3 className="font-display text-sm font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
                    <ChevronRight className="h-4 w-4 text-amber-600" />
                    {sec.title}
                  </h3>
                  <div className="whitespace-pre-line text-stone-600 font-sans text-[12px] leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-stone-400 text-xs">
                No matching terms found for &quot;{search}&quot;.
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 shrink-0">
            <span className="text-[11px] text-stone-400">ELESENE Support: support@elesene.com</span>
            <button
              onClick={onClose}
              className="rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-stone-800 cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
