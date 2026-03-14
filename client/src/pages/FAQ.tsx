import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { FC } from 'react'

const FAQPage: FC = () => {
  const faqs = [
    {
      question: 'What is TINAR?',
      answer:
        'TINAR is a modern social network designed for creators, thinkers, and anyone looking for a safe space to belong.',
    },
    {
      question: 'Is TINAR free to use?',
      answer: 'Yes, joining and using the core features of TINAR is completely free.',
    },
    {
      question: 'How can I protect my account?',
      answer:
        'Use a strong password and never share your login details. You can also manage your privacy from the settings.',
    },
  ]

  const faqs_ar = [
    {
      question: 'ما هو تينار؟',
      answer:
        'تينار هي شبكة تواصل اجتماعي حديثة صُممت للمبدعين والمفكرين وكل من يبحث عن مساحة آمنة للتعبير.',
    },
    {
      question: 'هل استخدام تينار مجاني؟',
      answer: 'نعم، الانضمام واستخدام الميزات الأساسية في تينار مجاني تماماً.',
    },
    {
      question: 'كيف أحمي حسابي؟',
      answer:
        'استخدم كلمة مرور قوية ولا تشارك بيانات دخولك مع أحد. يمكنك أيضاً إدارة خصوصيتك عبر الإعدادات.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-strong p-6 sm:p-8 rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 glow-text text-primary">
            Frequently Asked Questions
          </h1>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-xl font-semibold text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div dir="rtl">
            <h1 className="text-3xl sm:text-4xl font-bold my-8 glow-text text-primary">
              الأسئلة الشائعة
            </h1>

            <Accordion type="single" collapsible className="w-full">
              {faqs_ar.map((faq, index) => (
                <AccordionItem value={`item-ar-${index}`} key={index}>
                  <AccordionTrigger className="text-xl font-semibold text-right text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-right">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage
