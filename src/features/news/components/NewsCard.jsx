import React from 'react';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const NewsCard = ({ article }) => {
    // Extract a cleaner source name if possible, or use default
    const sourceName = article.source?.title || article.source || 'News Source';

    return (
        <Card className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { e.target.src = 'https://source.unsplash.com/800x600/?hospital,nurse'; }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-primary/90 text-white shadow-sm backdrop-blur-sm">
                        {article.category}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-5 flex-1">
                <div className="flex justify-between items-center mb-3 text-xs text-slate-500">
                    <span className="font-medium text-primary uppercase tracking-wider">{sourceName}</span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(article.pubDate), 'MMM d, HH:mm')}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight line-clamp-2">
                    {article.title}
                </h3>

                <div className="text-sm text-slate-500 line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{ __html: article.contentSnippet || article.content }}
                />
            </CardContent>

            <CardFooter className="p-5 pt-0 mt-auto">
                <Button
                    variant="outline"
                    className="w-full gap-2 group"
                    onClick={() => window.open(article.link, '_blank')}
                >
                    Read Full Story
                    <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default NewsCard;
