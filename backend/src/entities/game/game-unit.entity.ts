import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';

type VocabularyWordJson = {
  id: string;
  text: string;
  icon?: string;
  emoji?: string;
  meaning?: string;
  link?: string;
  audio?: string;
  audioUrl?: string;
};

type MatchingJson = {
  title: string;
  pairs: Array<{ left: string; right: string }>;
};

type GamePartJson = {
  id: string;
  title: string;
  words: VocabularyWordJson[];
  enabledGames?: string[];
};

@Entity('game_units')
export class GameUnit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  unit: string;

  @Column({ type: 'varchar' })
  bookname: string;

  @Column({ type: 'varchar', nullable: true })
  backgroundColor: string;

  @Column({ type: 'simple-json' })
  flashcards: {
    title: string;
    autoAudio?: boolean;
    words: VocabularyWordJson[];
  };

  @Column({ type: 'simple-json', nullable: true })
  wordOrdering: {
    title: string;
    words: VocabularyWordJson[];
    showScore?: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  wordScramble: {
    title: string;
    words: VocabularyWordJson[];
    showScore?: boolean;
  };

  @Column({ type: 'simple-json', nullable: true })
  parts?: GamePartJson[];

  @Column({ type: 'simple-array' })
  enabledGames: string[];

  @Column({ type: 'varchar', default: 'kids' })
  bookType: string; // kids, starter, mover, flyer

  @Column({ type: 'boolean', nullable: true })
  useRotatingGame?: boolean;
}
