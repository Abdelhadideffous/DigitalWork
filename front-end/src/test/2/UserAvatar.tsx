// Ajoutez ce composant dans votre fichier ou créez un fichier séparé
// Il permet d'afficher un avatar avec des styles améliorés

import { Avatar } from "@mui/material";

interface User {
  name: string;
  avatar?: string;
}

const UserAvatar = ({ user, size = 48 }: { user: User; size?: number }) => {
    // Fonction pour générer les initiales d'un nom d'utilisateur
    const getInitials = (name: string) => {
      if (!name) return '';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    };
  
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: user?.avatar ? 'transparent' : '#f0f0f0',
          color: '#555',
          fontWeight: 'medium',
          fontSize: size > 40 ? '1rem' : '0.8rem',
          border: '1px solid #e0e0e0',
        }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            width={size}
            height={size}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          getInitials(user?.name || 'Utilisateur')
        )}
      </Avatar>
    );
  };
  
  export default UserAvatar;