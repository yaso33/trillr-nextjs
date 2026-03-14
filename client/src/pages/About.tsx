import type { FC } from 'react'

const AboutPage: FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-strong p-6 sm:p-8 rounded-lg">
          {/* English Version */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 glow-text text-primary">
              About TINAR
            </h1>
            <p className="text-xl text-muted-foreground mb-8">The Space to Be You.</p>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-primary">Our Story</h2>
              <p>
                TINAR was born from a simple idea: the internet needs a place where people can
                connect without the noise. We built this platform for the creators, the thinkers,
                and the dreamers who want a social network that respects their individuality and
                privacy.
              </p>

              <h2 className="text-2xl font-semibold text-primary">Our Mission</h2>
              <p>
                To empower global conversations by providing a clean, safe, and intuitive
                environment. We believe that technology should bring us closer to our true selves
                and to each other, without compromising our data or our digital well-being.
              </p>

              <h2 className="text-2xl font-semibold text-primary">Why TINAR?</h2>
              <ul>
                <li>
                  <strong>Privacy First:</strong> Your data belongs to you, period.
                </li>
                <li>
                  <strong>Community Driven:</strong> We grow with our users, not at their expense.
                </li>
                <li>
                  <strong>Innovation:</strong> Simple tools designed for complex ideas.
                </li>
              </ul>
            </div>
          </div>

          {/* Arabic Version */}
          <div dir="rtl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 glow-text text-primary">عن تينار</h1>
            <p className="text-xl text-muted-foreground mb-8">المساحة التي تمثلك.</p>

            <div className="prose prose-invert max-w-none text-right">
              <h2 className="text-2xl font-semibold text-primary">قصتنا</h2>
              <p>
                وُلدت "تينار" من فكرة بسيطة: الإنترنت يحتاج إلى مكان يمكن للناس فيه التواصل بعيداً عن
                الضجيج. لقد أنشأنا هذه المنصة للمبدعين، المفكرين، والحالمين الذين يبحثون عن شبكة
                اجتماعية تحترم تفردهم وخصوصيتهم.
              </p>

              <h2 className="text-2xl font-semibold text-primary">مهمتنا</h2>
              <p>
                تمكين الحوارات العالمية من خلال توفير بيئة نقية، آمنة، وسهلة الاستخدام. نحن نؤمن بأن
                التكنولوجيا يجب أن تقربنا من أنفسنا الحقيقية ومن بعضنا البعض، دون المساس ببياناتنا
                أو سلامتنا الرقمية.
              </p>

              <h2 className="text-2xl font-semibold text-primary">لماذا تينار؟</h2>
              <ul>
                <li>
                  <strong>الخصوصية أولاً:</strong> بياناتك ملك لك وحده، دائماً وأبداً.
                </li>
                <li>
                  <strong>مجتمع تشاركي:</strong> نحن نكبر مع مستخدمينا، ولأجلهم.
                </li>
                <li>
                  <strong>الابتكار:</strong> أدوات بسيطة مصممة لأفكار عميقة.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
