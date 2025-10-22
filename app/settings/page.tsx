"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Wallet,
  Key,
  Database,
  Smartphone
} from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  })

  const [privacy, setPrivacy] = useState({
    profile: "public",
    transactions: "private",
    analytics: "anonymous"
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Settings</CardTitle>
          <p className="text-gray-400">
            Manage your account preferences and application settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Display Name
                </label>
                <Input
                  placeholder="Enter your name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Email Address
                </label>
                <Input
                  placeholder="your@email.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us about yourself"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <Button className="w-full">
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Settings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">MetaMask</div>
                    <div className="text-gray-400 text-sm">Connected</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Private Key</div>
                    <div className="text-gray-400 text-sm">Hidden</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Show</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Backup Wallet</div>
                    <div className="text-gray-400 text-sm">Last backup: 2 days ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Backup</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email Notifications</h3>
                <p className="text-gray-400 text-sm">Receive updates via email</p>
              </div>
              <Button 
                variant={notifications.email ? "default" : "outline"} 
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              >
                {notifications.email ? "Enabled" : "Disabled"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Push Notifications</h3>
                <p className="text-gray-400 text-sm">Get real-time updates</p>
              </div>
              <Button 
                variant={notifications.push ? "default" : "outline"} 
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
              >
                {notifications.push ? "Enabled" : "Disabled"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">SMS Notifications</h3>
                <p className="text-gray-400 text-sm">Receive text messages for important updates</p>
              </div>
              <Button 
                variant={notifications.sms ? "default" : "outline"} 
                size="sm"
                onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
              >
                {notifications.sms ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Profile Visibility</h3>
                <p className="text-gray-400 text-sm">Control who can see your profile</p>
              </div>
              <select
                value={privacy.profile}
                onChange={(e) => setPrivacy(prev => ({ ...prev, profile: e.target.value }))}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Transaction History</h3>
                <p className="text-gray-400 text-sm">Control transaction visibility</p>
              </div>
              <select
                value={privacy.transactions}
                onChange={(e) => setPrivacy(prev => ({ ...prev, transactions: e.target.value }))}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Analytics Data</h3>
                <p className="text-gray-400 text-sm">Share anonymous usage data</p>
              </div>
              <select
                value={privacy.analytics}
                onChange={(e) => setPrivacy(prev => ({ ...prev, analytics: e.target.value }))}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="anonymous">Anonymous</option>
                <option value="none">None</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Theme</h3>
                <p className="text-gray-400 text-sm">Choose your preferred theme</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Light</Button>
                <Button variant="default" size="sm">Dark</Button>
                <Button variant="outline" size="sm">Auto</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Language</h3>
                <p className="text-gray-400 text-sm">Select your preferred language</p>
              </div>
              <select className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Developer Mode</h3>
                <p className="text-gray-400 text-sm">Enable advanced debugging features</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">API Rate Limiting</h3>
                <p className="text-gray-400 text-sm">Configure API request limits</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Data Export</h3>
                <p className="text-gray-400 text-sm">Export your data</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
