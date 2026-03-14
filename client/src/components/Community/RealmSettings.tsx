import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import React from 'react'

const settingsCategories = ['Overview', 'Roles & Permissions', 'Member Management', 'Audit Log']

interface RealmSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const RealmSettings: React.FC<RealmSettingsProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = React.useState(settingsCategories[0])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex p-0 gap-0">
        {/* Left Sidebar for navigation */}
        <div className="w-1/3 bg-gray-100 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 rounded-l-lg">
          <h2 className="text-lg font-semibold mb-4 px-2">Realm Settings</h2>
          <ul>
            {settingsCategories.map((category) => (
              <li key={category} className="mb-1">
                <Button
                  variant={selectedCategory === category ? 'secondary' : 'ghost'}
                  onClick={() => setSelectedCategory(category)}
                  className="w-full justify-start text-base"
                >
                  {category}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right content area */}
        <div className="w-2/3 p-6 overflow-y-auto rounded-r-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCategory}</DialogTitle>
            <DialogDescription>Settings for {selectedCategory}.</DialogDescription>
          </DialogHeader>

          {/* Content for each category will go here */}
          <div className="mt-4">
            {selectedCategory === 'Overview' && <div>Overview Settings Content</div>}
            {selectedCategory === 'Roles & Permissions' && (
              <div>Roles & Permissions Settings Content</div>
            )}
            {selectedCategory === 'Member Management' && (
              <div>Member Management Settings Content</div>
            )}
            {selectedCategory === 'Audit Log' && <div>Audit Log Content</div>}
          </div>
        </div>

        {/* Close button */}
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RealmSettings
