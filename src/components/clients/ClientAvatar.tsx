
interface ClientAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ClientAvatar({ name, size = 'md' }: ClientAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-orange-500',
      'bg-green-500',
      'bg-red-500',
      'bg-purple-500',
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div className={`${getAvatarColor(name)} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold`}>
      {getInitials(name)}
    </div>
  );
}
