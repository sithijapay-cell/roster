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
            <CardContent className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {sourceName}
                    </Badge>
                    {article.isoDate && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(article.isoDate), 'MMM d, yyyy')}
                        </span>
                    )}
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
