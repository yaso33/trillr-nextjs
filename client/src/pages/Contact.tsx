import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type FC, useState } from 'react'

const ContactPage: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you can add logic to send the form data to your backend
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-strong p-6 sm:p-8 rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 glow-text text-primary">
            We’d Love to Hear from You.
          </h1>
          <p className="mb-8 text-muted-foreground">Get in touch with us for any inquiries.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-2 min-h-[150px]"
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary hover-lift">
                  Send Message
                </Button>
              </form>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Connect with Us</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <a href="mailto:support@tinar.com" className="text-primary hover:underline">
                    support@tinar.com
                  </a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Socials</h3>
                  <div className="flex space-x-4 mt-2">
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      X
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      Instagram
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
