export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary-500' : 'bg-charcoal-300'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function NotificationRow({ event, email, push, onEmailChange, onPushChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-charcoal-50/60 px-4 py-3">
      <p className="font-body text-sm font-medium text-charcoal-800">{event.label}</p>
      <div className="flex items-center gap-5">
        <label className="flex cursor-pointer items-center gap-2">
          <Toggle checked={email} onChange={onEmailChange} />
          <span className="font-body text-xs text-charcoal-500">Email</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Toggle checked={push} onChange={onPushChange} />
          <span className="font-body text-xs text-charcoal-500">Push</span>
        </label>
      </div>
    </div>
  );
}

export function NotificationBanner({ notification, onDismiss }) {
  if (!notification) return null;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs ${
        notification.type === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-sage-200 bg-sage-50 text-sage-700'
      }`}
    >
      <span>{notification.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-2xl leading-none opacity-60 transition-opacity hover:opacity-100"
      >
        &times;
      </button>
    </div>
  );
}

export function SettingsCard({ icon: Icon, title, description, iconBg, iconColor, children }) {
  return (
    <div className="max-w-lg rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-charcoal-100/70 px-5 py-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`text-base ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold text-charcoal-950">{title}</h3>
          {description && <p className="font-body text-xs text-charcoal-500">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function SettingsTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="mt-6 flex gap-1 rounded-xl bg-charcoal-50/70 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-heading text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-white text-charcoal-950 shadow-sm'
                : 'text-charcoal-500 hover:text-charcoal-800'
            }`}
          >
            <Icon className="text-base" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
