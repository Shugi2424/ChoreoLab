import { Box, Card, CardActionArea, CardContent, Chip, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Box>
      <Typography variant="h4" color="secondary.main" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
    </Box>
  );
}

interface NavCardProps {
  title: string;
  description: string;
  to: string;
  badge?: number;
}

export function NavCard({ title, description, to, badge }: NavCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea component={RouterLink} to={to} sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="h6" color="primary.main">
              {title}
            </Typography>
            {badge !== undefined && badge > 0 && (
              <Chip label={badge} size="small" color="primary" />
            )}
          </Box>
          <Typography color="text.secondary">{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
