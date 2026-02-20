import React from 'react';
import { ExternalLink, Play, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const NewsCard = ({ article }) => {
    const sourceName = article.source?.title || article.source || 'News Source';
    const isVideo = article.isVideo;

    return (
        <Card className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300 bg-card border-border">
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                {(() => {
                    const getYouTubeId = (url) => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                        const match = url?.match(regExp);
                        return (match && match[2].length === 11) ? match[2] : null;
                    };
                    const videoId = getYouTubeId(article.link) || getYouTubeId(article.content);

                    if (videoId) {
                        return (
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={article.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        );
                    }

                    return (
                        <>
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                onError={(e) => { e.target.src = `https://placehold.co/800x400/1e293b/94a3b8?text=${encodeURIComponent('News')}`; }}
                            />
                            {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}

                <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                    <Badge className="bg-primary/90 text-white shadow-sm backdrop-blur-sm">
                        {article.category}
                    </Badge>
                    {/* Conditionally render Video badge if needed, but iframe makes it obvious */}
                </div>
            </div>

            <CardContent className="p-5 flex-1">
                <div className="flex justify-between items-center mb-3 text-xs text-muted-foreground">
                    <span className="font-medium text-primary uppercase tracking-wider">{sourceName}</span>
                    {article.pubDate && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(article.pubDate), 'MMM d, HH:mm')}
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 leading-tight line-clamp-2">
                    {article.title}
                </h3>

                {article.contentSnippet && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {article.contentSnippet}
                    </p>
                )}
            </CardContent>

            <CardFooter className="p-5 pt-0 mt-auto">
                <Button
                    variant="outline"
                    className="w-full gap-2 group"
                    onClick={() => window.open(article.link, '_blank')}
                >
                    {isVideo ? 'Watch Video' : 'Read Full Story'}
                    {isVideo ? (
                        <Play className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    ) : (
                        <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default NewsCard;
