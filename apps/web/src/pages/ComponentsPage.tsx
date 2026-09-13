import { useState } from 'react';
import { Search, CircuitBoard, Radio, Thermometer, Compass, Eye, Sun, Monitor, RotateCcw, Zap, Bluetooth, Wifi, CreditCard, Square, Gamepad2, Sliders, Lightbulb, Volume2, ToggleLeft, Activity, Circle, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const ICONS: Record<string, any> = {
  CircuitBoard, Radio, Thermometer, Compass, Eye, Sun, Monitor, RotateCcw, 
  Zap, Bluetooth, Wifi, CreditCard, Square, Gamepad2, Sliders, Lightbulb, 
  Volume2, ToggleLeft, Activity, Circle, Settings: SettingsIcon
};

const COMPONENTS = [
  // Boards
  { id: 'arduino-uno', name: 'Arduino UNO R3', category: 'Boards', description: 'ATmega328P microcontroller board', pins: 14, voltage: '5V', icon: 'CircuitBoard' },
  { id: 'esp32', name: 'ESP32 DevKit', category: 'Boards', description: 'Dual-core WiFi+BT microcontroller', pins: 38, voltage: '3.3V', icon: 'CircuitBoard' },
  // Sensors
  { id: 'hc-sr04', name: 'HC-SR04', category: 'Sensors', description: 'Ultrasonic distance sensor, range 2-400cm', pins: 4, voltage: '5V', icon: 'Radio' },
  { id: 'dht11', name: 'DHT11', category: 'Sensors', description: 'Temperature & humidity sensor', pins: 3, voltage: '3-5V', icon: 'Thermometer' },
  { id: 'mpu6050', name: 'MPU-6050', category: 'Sensors', description: '6-axis gyroscope & accelerometer', pins: 4, voltage: '3.3-5V', icon: 'Compass' },
  // Displays
  { id: 'oled-ssd1306', name: 'OLED SSD1306', category: 'Displays', description: '128x64 I2C OLED display', pins: 4, voltage: '3.3-5V', icon: 'Monitor' },
  // Motors
  { id: 'sg90', name: 'SG90 Servo', category: 'Motors & Actuators', description: '9g mini servo motor, 0-180°', pins: 3, voltage: '4.8-6V', icon: 'RotateCcw' },
  { id: 'l298n', name: 'L298N Motor Driver', category: 'Motors & Actuators', description: 'Dual H-bridge motor driver, 2A per channel', pins: 11, voltage: '5-46V', icon: 'Zap' },
  // Comm
  { id: 'hc-05', name: 'HC-05 Bluetooth', category: 'Communication', description: 'Serial Bluetooth module', pins: 4, voltage: '3.3-5V', icon: 'Bluetooth' },
  // Input
  { id: 'button', name: 'Push Button', category: 'Input', description: 'Momentary push button', pins: 2, voltage: '3.3-5V', icon: 'Square' },
  { id: 'potentiometer', name: 'Potentiometer', category: 'Input', description: '10KΩ variable resistor', pins: 3, voltage: '3.3-5V', icon: 'Sliders' },
  // Output
  { id: 'led', name: 'LED', category: 'Power & Output', description: '5mm LED (various colors)', pins: 2, voltage: '1.8-3.3V', icon: 'Lightbulb' },
];

const CATEGORIES = ['All', ...Array.from(new Set(COMPONENTS.map(c => c.category)))];

export function ComponentsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = COMPONENTS.filter(c => 
    (activeCategory === 'All' || c.category === activeCategory) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-surface overflow-hidden">
      {/* Category Navigation */}
      <div className="w-full md:w-56 bg-surface-card border-b md:border-b-0 md:border-r border-surface-border flex flex-col flex-shrink-0">
        <div className="h-10 md:h-14 border-b border-surface-border hidden md:flex items-center px-4">
          <h2 className="text-sm font-semibold text-slate-200">Library</h2>
        </div>
        <div className="p-2 flex md:flex-col overflow-x-auto md:overflow-x-hidden gap-1.5 md:gap-1 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'whitespace-nowrap px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-colors text-left flex-shrink-0',
                activeCategory === cat ? 'bg-evoly-600/20 text-evoly-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <div className="min-h-14 px-4 sm:px-6 py-2.5 sm:py-0 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-shrink-0">
          <h1 className="text-xs sm:text-sm font-medium text-slate-300">Components / {activeCategory}</h1>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface-card border border-surface-border rounded-lg pl-9 pr-4 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-evoly-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(comp => {
              const Icon = ICONS[comp.icon] || CircuitBoard;
              return (
                <div key={comp.id} className="bg-surface-card border border-surface-border rounded-xl p-4 flex gap-4 hover:border-evoly-600/50 transition-colors group">
                  <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                    <Icon className="w-8 h-8 text-slate-400 group-hover:text-evoly-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-200">{comp.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{comp.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-surface px-2 py-0.5 rounded text-slate-400 border border-surface-border">{comp.pins} Pins</span>
                      <span className="text-[10px] bg-surface px-2 py-0.5 rounded text-slate-400 border border-surface-border">{comp.voltage}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
